"""Outils géographiques : distances, regroupement des points, lecture du GPS EXIF."""
from __future__ import annotations

import math
from PIL import Image

R_TERRE = 6371.0


def distance_km(lat1, lon1, lat2, lon2):
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp, dl = p2 - p1, math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R_TERRE * math.asin(min(1.0, math.sqrt(a)))


def regrouper(points, rayon_km=25.0, max_groupes=5):
    """points = [(lat, lon, poids)]. Regroupe les points proches et additionne leurs poids.

    Chaque groupe garde le centre pondéré et l'étalement (distance moyenne au centre),
    qui sert à dessiner le rond.
    """
    restants = sorted(points, key=lambda p: -p[2])
    groupes = []
    while restants and len(groupes) < max_groupes:
        lat0, lon0, _ = restants[0]
        dedans = [p for p in restants if distance_km(lat0, lon0, p[0], p[1]) <= rayon_km]
        restants = [p for p in restants if distance_km(lat0, lon0, p[0], p[1]) > rayon_km]
        w = sum(p[2] for p in dedans) or 1e-12
        lat = sum(p[0] * p[2] for p in dedans) / w
        lon = sum(p[1] * p[2] for p in dedans) / w
        etal = sum(distance_km(lat, lon, p[0], p[1]) * p[2] for p in dedans) / w
        groupes.append({"lat": lat, "lon": lon, "poids": w, "etalement_km": etal})
    total = sum(g["poids"] for g in groupes) or 1.0
    for g in groupes:
        g["proba"] = g["poids"] / total
    return groupes


def _rationnel(v):
    try:
        return float(v)
    except TypeError:
        return v[0] / v[1]


def gps_exif(chemin):
    """Renvoie (lat, lon) lus dans l'EXIF de la photo, ou None."""
    try:
        with Image.open(chemin) as im:
            gps = im.getexif().get_ifd(0x8825)
    except Exception:
        return None
    if not gps or 2 not in gps or 4 not in gps:
        return None
    try:
        def dms(t):
            d, m, s = (_rationnel(x) for x in t)
            return d + m / 60 + s / 3600
        lat, lon = dms(gps[2]), dms(gps[4])
        if gps.get(1) in ("S", b"S"):
            lat = -lat
        if gps.get(3) in ("W", b"W"):
            lon = -lon
    except Exception:
        return None
    if not (-90 <= lat <= 90 and -180 <= lon <= 180) or (lat == 0 and lon == 0):
        return None
    return lat, lon
