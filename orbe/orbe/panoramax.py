"""Banque d'images de rue Panoramax (le « Street View » public français, IGN + OpenStreetMap France).

Chaque photo Panoramax a sa position GPS exacte et une licence libre (CC-BY-SA ou Licence
Ouverte selon l'instance) : on peut les télécharger et s'en servir pour entraîner Orbe.
"""
from __future__ import annotations

import json
import os
import tempfile
import time
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image

from . import base
from .geo import distance_km

API = os.environ.get("ORBE_PANORAMAX_API", "https://api.panoramax.xyz/api").rstrip("/")
AGENT = "OrbeLocal/1.0 (geolocalisation personnelle)"

# Rectangles approximatifs (ouest, sud, est, nord)
ZONES = {
    "boulogne": ("Boulogne-Billancourt", (2.222, 48.822, 2.262, 48.849)),
    "issy": ("Issy-les-Moulineaux", (2.245, 48.815, 2.286, 48.835)),
    "sevres": ("Sèvres", (2.190, 48.810, 2.230, 48.832)),
    "saint_cloud": ("Saint-Cloud", (2.185, 48.830, 2.225, 48.860)),
    "paris15": ("Paris 15e", (2.264, 48.825, 2.320, 48.858)),
    "paris16": ("Paris 16e", (2.224, 48.835, 2.297, 48.881)),
}


def _get(url, timeout=30):
    req = urllib.request.Request(url, headers={"User-Agent": AGENT, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def chercher(bbox, limite):
    """Photos Panoramax dans un rectangle : [(id, lat, lon, url_image, auteur, licence)]."""
    q = urllib.parse.urlencode({"bbox": ",".join(f"{v:.6f}" for v in bbox), "limit": limite})
    data = json.loads(_get(f"{API}/search?{q}"))
    out = []
    for f in data.get("features", []):
        try:
            lon, lat = f["geometry"]["coordinates"][:2]
        except (KeyError, TypeError, ValueError):
            continue
        assets = f.get("assets") or {}
        a = assets.get("sd") or assets.get("hd") or next(
            (v for v in assets.values() if "visual" in (v.get("roles") or [])), None)
        if not a or not a.get("href"):
            continue
        p = f.get("properties") or {}
        auteur = ", ".join(x.get("name", "") for x in (p.get("providers") or []) if isinstance(x, dict)) or ""
        out.append((str(f.get("id")), float(lat), float(lon), a["href"], auteur, str(p.get("license") or "")))
    return out


def vue_avant(chemin: Path):
    """Une photo 360° (2:1) est coupée en vue avant, comme une photo prise au téléphone."""
    with Image.open(chemin) as im:
        w, h = im.size
        if w >= 1.9 * h:
            lw = int(h * 4 / 3)
            g = (w - lw) // 2
            im.crop((g, 0, g + lw, h)).convert("RGB").save(chemin, "JPEG", quality=90)


def importer(moteur, zones, par_zone=300, ecart_min_m=25, suivi=lambda m, f: None):
    """Télécharge des images réparties sur chaque zone et les ajoute aux exemples."""
    deja = base.empreintes()
    gardes = [(l["lat"], l["lon"]) for l in base.exemples() if l["source"] == "panoramax"]
    bilan = {"ajoutees": 0, "deja_la": 0, "trop_proches": 0, "erreurs": 0, "zones": {}}
    grille = 6  # 6 x 6 cases par zone : les images couvrent toute la zone, pas une seule rue
    for zi, cle in enumerate(zones):
        if cle not in ZONES:
            continue
        nom, (o, s, e, n) = ZONES[cle]
        ajout_zone = 0
        par_case = max(2, -(-par_zone // (grille * grille)))
        cases = [(o + (e - o) * i / grille, s + (n - s) * j / grille, o + (e - o) * (i + 1) / grille, s + (n - s) * (j + 1) / grille)
                 for i in range(grille) for j in range(grille)]
        for ci, case in enumerate(cases):
            if ajout_zone >= par_zone:
                break
            suivi(f"{nom} · secteur {ci + 1}/{len(cases)} · {ajout_zone} images", (zi + ci / len(cases)) / len(zones))
            try:
                trouves = chercher(case, par_case * 4)
            except Exception:
                bilan["erreurs"] += 1
                continue
            pris = 0
            for ident, lat, lon, url, auteur, licence in trouves:
                if pris >= par_case or ajout_zone >= par_zone:
                    break
                empreinte = f"panoramax:{ident}"
                if empreinte in deja:
                    bilan["deja_la"] += 1
                    continue
                # On évite 50 images consécutives de la même rue
                if any(distance_km(lat, lon, a, b) * 1000 < ecart_min_m for a, b in gardes[-400:]):
                    bilan["trop_proches"] += 1
                    continue
                try:
                    with tempfile.TemporaryDirectory() as d:
                        f = Path(d) / "vue.jpg"
                        f.write_bytes(_get(url, timeout=60))
                        vue_avant(f)
                        base.ajouter(f, lat, lon, "panoramax", moteur.caracteristiques(f),
                                     note=f"Panoramax {ident} · {auteur} · {licence}".strip(" ·"), empreinte=empreinte)
                except Exception:
                    bilan["erreurs"] += 1
                    continue
                deja.add(empreinte)
                gardes.append((lat, lon))
                pris += 1
                ajout_zone += 1
                bilan["ajoutees"] += 1
            time.sleep(0.2)  # politesse envers le serveur public
        bilan["zones"][nom] = ajout_zone
    suivi("Terminé", 1.0)
    return bilan
