"""Banque d'images de rue Panoramax (le « Street View » public français, IGN + OpenStreetMap France).

Chaque photo Panoramax a sa position GPS exacte et une licence libre (CC-BY-SA ou Licence
Ouverte selon l'instance) : on peut les télécharger et s'en servir pour entraîner Orbe.
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


def _cases(bbox, cote_m):
    o, s, e, n = bbox
    lat_m = 111_195.0
    lon_m = lat_m * math.cos(math.radians((s + n) / 2))
    nx = max(1, round((e - o) * lon_m / cote_m))
    ny = max(1, round((n - s) * lat_m / cote_m))
    return [(o + (e - o) * i / nx, s + (n - s) * j / ny, o + (e - o) * (i + 1) / nx, s + (n - s) * (j + 1) / ny)
            for i in range(nx) for j in range(ny)]


def importer(moteur, zones, par_zone=300, ecart_min_m=25, cote_m=150, suivi=lambda m, f: None):
    """Télécharge des images réparties sur toute la zone et les ajoute aux exemples.

    La zone est découpée en carrés d'environ 150 m, visités dans le désordre. Au premier passage
    on prend une image par carré (la plus éloignée de celles déjà gardées), puis une deuxième
    au passage suivant si le compte n'est pas atteint. Ainsi toute la ville est couverte avant
    qu'une rue reçoive une deuxième image.
    """
    deja = base.empreintes()
    gardes = [(l["lat"], l["lon"]) for l in base.exemples() if l["source"] == "panoramax"]
    bilan = {"ajoutees": 0, "deja_la": 0, "trop_proches": 0, "erreurs": 0, "carres_vides": 0, "zones": {}}
    hasard = random.Random(0)
    for zi, cle in enumerate(zones):
        if cle not in ZONES:
            continue
        nom, bbox = ZONES[cle]
        cases = _cases(bbox, cote_m)
        hasard.shuffle(cases)
        ajout_zone, cache = 0, {}
        for passage in range(3):
            if ajout_zone >= par_zone:
                break
            for ci, case in enumerate(cases):
                if ajout_zone >= par_zone:
                    break
                if ci % 5 == 0:
                    suivi(f"{nom} · passage {passage + 1} · carré {ci + 1}/{len(cases)} · {ajout_zone} images",
                          (zi + min(1, (passage * len(cases) + ci) / max(1, len(cases)))) / len(zones))
                if case not in cache:
                    try:
                        cache[case] = chercher(case, 30)
                        time.sleep(0.1)  # politesse envers le serveur public
                    except Exception:
                        bilan["erreurs"] += 1
                        cache[case] = []
                    if not cache[case]:
                        bilan["carres_vides"] += 1
                candidats = []
                for t in cache[case]:
                    if f"panoramax:{t[0]}" in deja:
                        continue
                    proches = [distance_km(t[1], t[2], a, b) for a, b in gardes[-2000:]]
                    d = min(proches) * 1000 if proches else 1e9
                    if d >= ecart_min_m:
                        candidats.append((d, t))
                if not candidats:
                    continue
                _, (ident, lat, lon, url, auteur, licence) = max(candidats)  # la plus éloignée des images déjà gardées
                try:
                    with tempfile.TemporaryDirectory() as d:
                        f = Path(d) / "vue.jpg"
                        f.write_bytes(_get(url, timeout=60))
                        vue_avant(f)
                        base.ajouter(f, lat, lon, "panoramax", moteur.caracteristiques(f),
                                     note=f"Panoramax {ident} · {auteur} · {licence}".strip(" ·"), empreinte=f"panoramax:{ident}")
                except Exception:
                    bilan["erreurs"] += 1
                    deja.add(f"panoramax:{ident}")  # on ne réessaie pas la même image
                    continue
                deja.add(f"panoramax:{ident}")
                gardes.append((lat, lon))
                ajout_zone += 1
                bilan["ajoutees"] += 1
        bilan["zones"][nom] = ajout_zone
        bilan.setdefault("carres", {})[nom] = len(cases)
    suivi("Terminé", 1.0)
    return bilan
