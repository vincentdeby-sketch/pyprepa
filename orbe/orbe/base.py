"""La base d'exemples : photos dont on connaît la position, avec leurs caractéristiques CLIP.

Une photo n'entre ici que si sa position est sûre : GPS de l'appareil, correction faite
à la main sur la carte, ou proposition de Claude validée à la main.
"""
from __future__ import annotations

import hashlib
import json
import shutil
import threading
import time
import uuid
from pathlib import Path

import numpy as np

from .config import ATTENTE, BASE, PHOTOS

SOURCES = {"exif": "GPS de la photo", "correction": "Corrigée sur la carte", "claude_valide": "Proposée par Claude, validée",
           "panoramax": "Image de rue Panoramax", "mapillary": "Image de rue Mapillary"}

_verrou = threading.RLock()


def _lire():
    if not BASE.exists():
        return []
    try:
        return json.loads(BASE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        # On ne détruit jamais une base illisible : on la met de côté.
        BASE.rename(BASE.with_suffix(f".illisible-{int(time.time())}.json"))
        return []


def _ecrire(lignes):
    tmp = BASE.with_suffix(".tmp")
    tmp.write_text(json.dumps(lignes, ensure_ascii=False, indent=1), encoding="utf-8")
    tmp.replace(BASE)


def exemples():
    with _verrou:
        return _lire()


def ajouter(chemin_photo: Path, lat: float, lon: float, source: str, carac: np.ndarray, note: str = "", empreinte: str = ""):
    """Copie la photo dans la base et enregistre sa position et ses caractéristiques."""
    if source not in SOURCES:
        raise ValueError(f"source inconnue : {source}")
    if not (-90 <= lat <= 90 and -180 <= lon <= 180):
        raise ValueError("coordonnées hors limites")
    with _verrou:
        lignes = _lire()
        ident = uuid.uuid4().hex[:12]
        dest = PHOTOS / f"{ident}{Path(chemin_photo).suffix.lower() or '.jpg'}"
        shutil.copy2(chemin_photo, dest)
        np.save(PHOTOS / f"{ident}.npy", carac.astype(np.float32))
        lignes.append({"id": ident, "fichier": dest.name, "lat": lat, "lon": lon, "source": source,
                       "note": note, "empreinte": empreinte, "date": time.time()})
        _ecrire(lignes)
        return lignes[-1]


def ajouter_plusieurs(lignes):
    """lignes = [(chemin, lat, lon, source, carac, note, empreinte)] : une seule écriture de la base."""
    with _verrou:
        base_ = _lire()
        for chemin, lat, lon, source, carac, note, empr in lignes:
            if source not in SOURCES or not (-90 <= lat <= 90 and -180 <= lon <= 180):
                continue
            ident = uuid.uuid4().hex[:12]
            dest = PHOTOS / f"{ident}.jpg"
            shutil.copy2(chemin, dest)
            np.save(PHOTOS / f"{ident}.npy", np.asarray(carac, np.float32))
            base_.append({"id": ident, "fichier": dest.name, "lat": lat, "lon": lon, "source": source,
                          "note": note, "empreinte": empr, "date": time.time()})
        _ecrire(base_)


def empreinte(chemin) -> str:
    h = hashlib.sha1()
    with open(chemin, "rb") as f:
        for bloc in iter(lambda: f.read(1 << 20), b""):
            h.update(bloc)
    return h.hexdigest()


def empreintes():
    return {l.get("empreinte") for l in exemples() if l.get("empreinte")}


def supprimer(ident: str):
    with _verrou:
        lignes = _lire()
        reste = [l for l in lignes if l["id"] != ident]
        if len(reste) == len(lignes):
            return False
        for l in lignes:
            if l["id"] == ident:
                (PHOTOS / l["fichier"]).unlink(missing_ok=True)
                (PHOTOS / f"{ident}.npy").unlink(missing_ok=True)
        _ecrire(reste)
        return True


def caracteristiques():
    """(ids, coords (n,2), carac (n,2,768)) des exemples dont les caractéristiques existent."""
    ids, coords, feats = [], [], []
    for l in exemples():
        f = PHOTOS / f"{l['id']}.npy"
        if f.exists():
            ids.append(l["id"])
            coords.append((l["lat"], l["lon"]))
            feats.append(np.load(f))
    if not ids:
        return [], np.zeros((0, 2), np.float32), np.zeros((0, 2, 768), np.float32)
    return ids, np.asarray(coords, np.float32), np.stack(feats).astype(np.float32)


# ---------- photos en attente de validation (propositions de Claude) ----------
ATTENTE_JSON = ATTENTE / "propositions.json"


def propositions():
    if not ATTENTE_JSON.exists():
        return []
    try:
        return json.loads(ATTENTE_JSON.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return []


def _ecrire_propositions(p):
    tmp = ATTENTE_JSON.with_suffix(".tmp")
    tmp.write_text(json.dumps(p, ensure_ascii=False, indent=1), encoding="utf-8")
    tmp.replace(ATTENTE_JSON)


def proposer(chemin_photo: Path, carac: np.ndarray, analyse: dict):
    with _verrou:
        p = propositions()
        ident = uuid.uuid4().hex[:12]
        dest = ATTENTE / f"{ident}{Path(chemin_photo).suffix.lower() or '.jpg'}"
        shutil.copy2(chemin_photo, dest)
        np.save(ATTENTE / f"{ident}.npy", carac.astype(np.float32))
        p.append({"id": ident, "fichier": dest.name, "analyse": analyse, "date": time.time()})
        _ecrire_propositions(p)
        return p[-1]


def retirer_proposition(ident: str):
    """Retire une proposition et renvoie (ligne, chemin_photo, carac) pour une éventuelle validation."""
    with _verrou:
        p = propositions()
        ligne = next((x for x in p if x["id"] == ident), None)
        if not ligne:
            return None
        _ecrire_propositions([x for x in p if x["id"] != ident])
        return ligne, ATTENTE / ligne["fichier"], ATTENTE / f"{ident}.npy"
