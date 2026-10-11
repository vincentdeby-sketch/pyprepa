"""Banque d'images de rue, partout sur Terre.

Deux sources, chaque image avec sa position GPS exacte et une licence libre :
- Panoramax (IGN + OpenStreetMap France) : très bonne couverture en France, sans clé ;
- Mapillary : couverture mondiale, clé gratuite (mapillary.com/dashboard/developers).

La zone (n'importe quel rectangle) est découpée en carrés visités dans le désordre : une image
par carré et par passage, la plus éloignée des images déjà gardées. Les images sont téléchargées
en parallèle et passées au modèle par lots, pour aller plus vite.
"""
from __future__ import annotations

import json
import math
import os
import random
import tempfile
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
from pathlib import Path

from PIL import Image

from . import base
from .config import DONNEES
from .geo import distance_km

PANORAMAX = os.environ.get("ORBE_PANORAMAX_API", "https://api.panoramax.xyz/api").rstrip("/")
MAPILLARY = "https://graph.mapillary.com/images"
AGENT = "OrbeLocal/1.0 (geolocalisation personnelle)"
MAX_IMAGES = 3000

# Raccourcis (ouest, sud, est, nord)
ZONES = {
    "boulogne": ("Boulogne-Billancourt", (2.222, 48.822, 2.262, 48.849)),
    "issy": ("Issy-les-Moulineaux", (2.245, 48.815, 2.286, 48.835)),
    "sevres": ("Sèvres", (2.190, 48.810, 2.230, 48.832)),
    "saint_cloud": ("Saint-Cloud", (2.185, 48.830, 2.225, 48.860)),
    "paris15": ("Paris 15e", (2.264, 48.825, 2.320, 48.858)),
    "paris16": ("Paris 16e", (2.224, 48.835, 2.297, 48.881)),
}


# ---------- clé Mapillary ----------
def _fichier_cle():
    return DONNEES / "mapillary.txt"


def cle_mapillary():
    cle = os.environ.get("MAPILLARY_TOKEN", "").strip()
    if not cle and _fichier_cle().exists():
        cle = _fichier_cle().read_text(encoding="utf-8").strip()
    return cle or None


def enregistrer_cle_mapillary(cle: str):
    cle = (cle or "").strip()
    if cle:
        _fichier_cle().write_text(cle, encoding="utf-8")
    else:
        _fichier_cle().unlink(missing_ok=True)


# ---------- requêtes ----------
def _get(url, timeout=30, entetes=None):
    req = urllib.request.Request(url, headers={"User-Agent": AGENT, **(entetes or {})})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def chercher_panoramax(bbox, limite):
    """[(source, id, lat, lon, url_image, auteur, licence)] dans un rectangle."""
    q = urllib.parse.urlencode({"bbox": ",".join(f"{v:.6f}" for v in bbox), "limit": limite})
    data = json.loads(_get(f"{PANORAMAX}/search?{q}", entetes={"Accept": "application/json"}))
    out = []
    for f in data.get("features", []):
        try:
            lon, lat = (float(x) for x in f["geometry"]["coordinates"][:2])
        except (KeyError, TypeError, ValueError):
            continue
        a = f.get("assets") or {}
        # La vignette suffit : le modèle regarde l'image en 224 x 224.
        img = a.get("thumb") or a.get("sd") or a.get("hd")
        if not img or not img.get("href"):
            continue
        p = f.get("properties") or {}
        auteur = ", ".join(x.get("name", "") for x in (p.get("providers") or []) if isinstance(x, dict))
        out.append(("panoramax", str(f.get("id")), lat, lon, img["href"], auteur, str(p.get("license") or "")))
    return out


def chercher_mapillary(bbox, limite):
    cle = cle_mapillary()
    if not cle:
        return []
    o, s, e, n = bbox
    # Mapillary refuse les rectangles de plus de 0,001 degré carré : on interroge le centre du carré.
    cx, cy, d = (o + e) / 2, (s + n) / 2, 0.012
    o, e = max(o, cx - d), min(e, cx + d)
    s, n = max(s, cy - d), min(n, cy + d)
    q = urllib.parse.urlencode({"fields": "id,computed_geometry,geometry,thumb_1024_url",
                                "bbox": f"{o:.6f},{s:.6f},{e:.6f},{n:.6f}", "limit": limite})
    data = json.loads(_get(f"{MAPILLARY}?{q}", entetes={"Authorization": f"OAuth {cle}"}))
    out = []
    for im in data.get("data", []):
        g = im.get("computed_geometry") or im.get("geometry") or {}
        try:
            lon, lat = (float(x) for x in g["coordinates"][:2])
        except (KeyError, TypeError, ValueError):
            continue
        if im.get("thumb_1024_url"):
            out.append(("mapillary", str(im["id"]), lat, lon, im["thumb_1024_url"], "Mapillary", "CC-BY-SA-4.0"))
    return out


CHERCHEURS = {"panoramax": chercher_panoramax, "mapillary": chercher_mapillary}


def sources_dispo(choix="auto"):
    if choix == "panoramax":
        return ["panoramax"]
    if choix == "mapillary":
        return ["mapillary"] if cle_mapillary() else []
    return ["panoramax"] + (["mapillary"] if cle_mapillary() else [])


# ---------- géométrie ----------
def surface_km2(bbox):
    o, s, e, n = bbox
    return abs(e - o) * 111.195 * math.cos(math.radians((s + n) / 2)) * abs(n - s) * 111.195


def _cases(bbox, nombre, cote_min_m=150):
    """Carrés d'au moins 150 m ; plus grands si la zone est vaste (un pays, le monde)."""
    o, s, e, n = bbox
    cote = max(cote_min_m, math.sqrt(surface_km2(bbox) * 1e6 / (nombre * 1.5)))
    lat_m = 111_195.0
    lon_m = max(1.0, lat_m * math.cos(math.radians((s + n) / 2)))
    nx = max(1, min(400, round((e - o) * lon_m / cote)))
    ny = max(1, min(400, round((n - s) * lat_m / cote)))
    return [(o + (e - o) * i / nx, s + (n - s) * j / ny, o + (e - o) * (i + 1) / nx, s + (n - s) * (j + 1) / ny)
            for i in range(nx) for j in range(ny)]


def vue_avant(im: Image.Image) -> Image.Image:
    """Une photo 360° (2:1) est coupée en vue avant, comme une photo prise au téléphone."""
    w, h = im.size
    if w >= 1.9 * h:
        lw = int(h * 4 / 3)
        g = (w - lw) // 2
        im = im.crop((g, 0, g + lw, h))
    return im.convert("RGB")


# ---------- import ----------
def importer(moteur, bbox, nom="Zone", nombre=300, source="auto", ecart_min_m=25, suivi=lambda m, f: None):
    o, s, e, n = bbox
    if not (-180 <= o < e <= 180 and -90 <= s < n <= 90):
        raise ValueError("Zone invalide.")
    sources = sources_dispo(source)
    if not sources:
        raise ValueError("Aucune source disponible : ajoutez une clé Mapillary.")
    nombre = max(1, min(MAX_IMAGES, int(nombre)))
    deja = base.empreintes()
    gardes = [(l["lat"], l["lon"]) for l in base.exemples() if l["source"] in CHERCHEURS]
    bilan = {"zone": nom, "ajoutees": 0, "erreurs": 0, "carres_vides": 0, "par_source": {k: 0 for k in sources}}
    cases = _cases(bbox, nombre)
    random.Random(0).shuffle(cases)
    bilan["carres"] = len(cases)

    # 1. Repérage : on interroge les carrés (4 à la fois) et on choisit une image par carré.
    pannes = []

    def interroger(case):
        for src in sources:
            try:
                r = CHERCHEURS[src](case, 30)
            except Exception as e:
                pannes.append(f"{src} : {e}")
                r = None
            if r:
                return r
        return []

    choisies, cache = [], {}
    for passage in range(3):
        if len(choisies) >= nombre:
            break
        a_faire = [c for c in cases if c not in cache]
        with ThreadPoolExecutor(4) as pool:
            for i, (case, res) in enumerate(zip(a_faire, pool.map(interroger, a_faire))):
                cache[case] = res
                if not res:
                    bilan["carres_vides"] += 1
                if i % 10 == 0:
                    suivi(f"{nom} · repérage des images {i + 1}/{len(a_faire)}", 0.3 * (i + 1) / max(1, len(a_faire)))
        for case in cases:
            if len(choisies) >= nombre:
                break
            meilleur = None
            for t in cache[case]:
                if f"{t[0]}:{t[1]}" in deja:
                    continue
                d = min((distance_km(t[2], t[3], a, b) for a, b in gardes), default=1e9) * 1000
                if d >= ecart_min_m and (meilleur is None or d > meilleur[0]):
                    meilleur = (d, t)
            if meilleur:
                t = meilleur[1]
                choisies.append(t)
                deja.add(f"{t[0]}:{t[1]}")
                gardes.append((t[2], t[3]))

    if not choisies and pannes and len(pannes) >= len(cache) * len(sources):
        raise RuntimeError(f"Les banques d'images de rue ne répondent pas. Vérifiez la connexion internet. ({pannes[0][:160]})")
    bilan["pannes_recherche"] = len(pannes)

    # 2. Téléchargement en parallèle, passage au modèle par lots de 16.
    def telecharger(t):
        try:
            return t, vue_avant(Image.open(BytesIO(_get(t[4], timeout=60))))
        except Exception:
            return t, None

    lot = 16
    with ThreadPoolExecutor(8) as pool:
        for i in range(0, len(choisies), lot):
            paquet = [x for x in pool.map(telecharger, choisies[i:i + lot])]
            ok = [(t, im) for t, im in paquet if im is not None]
            bilan["erreurs"] += len(paquet) - len(ok)
            if ok:
                feats = moteur.caracteristiques_images([im for _, im in ok])
                with tempfile.TemporaryDirectory() as d:
                    lignes = []
                    for k, ((src, ident, lat, lon, _, auteur, licence), im) in enumerate(ok):
                        f = Path(d) / f"{k}.jpg"
                        im.save(f, "JPEG", quality=88)
                        lignes.append((f, lat, lon, src, feats[k], f"{src.capitalize()} {ident} · {auteur} · {licence}".strip(" ·"), f"{src}:{ident}"))
                        bilan["par_source"][src] = bilan["par_source"].get(src, 0) + 1
                    base.ajouter_plusieurs(lignes)
                bilan["ajoutees"] += len(ok)
            suivi(f"{nom} · {bilan['ajoutees']}/{len(choisies)} images apprises", 0.3 + 0.7 * min(1, (i + lot) / max(1, len(choisies))))
    suivi("Terminé", 1.0)
    return bilan
