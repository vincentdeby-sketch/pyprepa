"""Serveur local d'Orbe : http://127.0.0.1:8765"""
from __future__ import annotations

import os
from contextlib import asynccontextmanager
import shutil
import threading
import time
import traceback
import uuid
from pathlib import Path

import numpy as np
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from . import base, claude
from .config import ATTENTE, DONNEES, PHOTOS
from .geo import gps_exif
from .moteur import METRIQUES, Moteur

TELEV = DONNEES / "televersements"
TELEV.mkdir(parents=True, exist_ok=True)
EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
STATIC = Path(__file__).parent / "static"

@asynccontextmanager
async def demarrage(_app):
    # Le modèle se charge dès le lancement, sans attendre l'ouverture de la page.
    from .config import PORT
    url = f"http://127.0.0.1:{PORT}"
    print(f"Orbe est prêt : {url}  (Ctrl+C pour arrêter)")
    if os.environ.get("ORBE_OUVRIR_NAVIGATEUR") == "1":
        import webbrowser
        threading.Timer(0.5, lambda: webbrowser.open(url)).start()
    if os.environ.get("ORBE_CHARGER_AU_DEMARRAGE", "1") == "1":
        print("Chargement du modèle (premier lancement : téléchargement d'environ 1,7 Go)…")
        try:
            charger()
        except HTTPException:
            pass
    yield


app = FastAPI(title="Orbe Local", lifespan=demarrage)
moteur = Moteur()

# ---------- tâches longues (une à la fois) ----------
tache = {"nom": None, "message": "", "frac": 0.0, "en_cours": False, "erreur": None, "resultat": None}
_verrou_tache = threading.Lock()


def lancer(nom, fn):
    with _verrou_tache:
        if tache["en_cours"]:
            raise HTTPException(409, f"Une tâche est déjà en cours : {tache['nom']}.")
        tache.update(nom=nom, message="Démarrage…", frac=0.0, en_cours=True, erreur=None, resultat=None)

    def suivi(msg, frac):
        tache.update(message=msg, frac=round(frac, 3))

    def corps():
        try:
            tache["resultat"] = fn(suivi)
        except Exception as e:  # l'erreur est affichée dans l'interface
            traceback.print_exc()
            tache["erreur"] = str(e)
        finally:
            tache["en_cours"] = False

    threading.Thread(target=corps, daemon=True).start()
    return {"ok": True}


# ---------- état ----------
@app.get("/api/etat")
def etat():
    import json
    m = json.loads(METRIQUES.read_text(encoding="utf-8")) if METRIQUES.exists() else None
    return {"modele_charge": moteur.pret(), "tete": getattr(moteur, "tete_source", "base"),
            "n_exemples": len(base.exemples()), "n_propositions": len(base.propositions()),
            "claude": claude.mode(), "metriques": m, "tache": tache}


@app.get("/api/tache")
def etat_tache():
    return tache


# ---------- analyse ----------
def _carac_televersement(ident):
    photo = next((p for p in TELEV.glob(f"{ident}.*") if p.suffix.lower() in EXT), None)
    if not photo:
        raise HTTPException(404, "Analyse introuvable.")
    f = TELEV / f"{ident}.npy"
    if f.exists():
        return photo, np.load(f)
    c = moteur.caracteristiques(photo)
    np.save(f, c)
    return photo, c


@app.post("/api/analyser")
def analyser(photo: UploadFile = File(...), avec_claude: bool = Form(True)):
    ext = Path(photo.filename or "").suffix.lower()
    if ext not in EXT:
        raise HTTPException(400, "Format non pris en charge : JPEG, PNG, WebP ou GIF. Les HEIC d'iPhone doivent être convertis en JPEG.")
    ident = uuid.uuid4().hex[:12]
    dest = TELEV / f"{ident}{ext}"
    with open(dest, "wb") as f:
        shutil.copyfileobj(photo.file, f)
    t0 = time.time()
    _, carac = _carac_televersement(ident)
    local = moteur.predire(carac)
    gps = gps_exif(dest)
    rep = {"id": ident, "photo": f"/televersements/{dest.name}", "local": local, "gps_photo": gps,
           "claude": None, "erreur_claude": None, "duree_local_s": round(time.time() - t0, 1)}
    if avec_claude and claude.mode():
        try:
            rep["claude"] = claude.analyser(dest, local)
        except Exception as e:
            rep["erreur_claude"] = str(e)
    rep["final"] = decision(local, rep["claude"])
    return rep


def decision(local, avis):
    """Claude a le dernier mot quand il est assez sûr ; sinon on garde le meilleur candidat local."""
    top = local["candidats"][0] if local["candidats"] else None
    if avis and avis["lat"] is not None and avis["confiance"] >= 0.35:
        return {"lat": avis["lat"], "lon": avis["lon"], "rayon_km": avis["rayon_km"], "confiance": avis["confiance"],
                "par": "claude", "accord": avis["accord_modele"] > 0}
    if top:
        return {"lat": top["lat"], "lon": top["lon"], "rayon_km": top["rayon_km"], "confiance": top["proba"],
                "par": "local", "accord": None}
    return None


class Position(BaseModel):
    lat: float
    lon: float


@app.post("/api/analyses/{ident}/valider")
def valider_analyse(ident: str, pos: Position):
    """La position est juste (ou corrigée sur la carte) : la photo devient un exemple."""
    photo, carac = _carac_televersement(ident)
    e = base.empreinte(photo)
    if e in base.empreintes():
        raise HTTPException(409, "Cette photo est déjà dans vos exemples.")
    return base.ajouter(photo, pos.lat, pos.lon, "correction", carac, empreinte=e)


# ---------- import d'un dossier de photos géolocalisées ----------
class Dossier(BaseModel):
    dossier: str
    maximum: int = 50


def _images(dossier):
    d = Path(os.path.expanduser(dossier.strip().strip('"')))
    if not d.is_dir():
        raise HTTPException(400, f"Dossier introuvable : {d}")
    return sorted(p for p in d.rglob("*") if p.suffix.lower() in EXT)


@app.post("/api/importer")
def importer(req: Dossier):
    images = _images(req.dossier)

    def travail(suivi):
        deja = base.empreintes()
        ajout = sans_gps = doublons = erreurs = 0
        for i, p in enumerate(images):
            suivi(f"{i + 1}/{len(images)} · {p.name}", (i + 1) / max(1, len(images)))
            try:
                gps = gps_exif(p)
                if not gps:
                    sans_gps += 1
                    continue
                e = base.empreinte(p)
                if e in deja:
                    doublons += 1
                    continue
                base.ajouter(p, gps[0], gps[1], "exif", moteur.caracteristiques(p), note=p.name, empreinte=e)
                deja.add(e)
                ajout += 1
            except Exception:
                traceback.print_exc()
                erreurs += 1
        return {"vues": len(images), "ajoutees": ajout, "sans_gps": sans_gps, "doublons": doublons, "erreurs": erreurs}

    return lancer("Import de photos", travail)


@app.post("/api/claude-proposer")
def claude_proposer(req: Dossier):
    """Pour des photos sans GPS : Claude propose une position, que vous validez ensuite une par une."""
    if not claude.mode():
        raise HTTPException(400, "Claude n'est pas configuré.")
    images = _images(req.dossier)

    def travail(suivi):
        deja = base.empreintes()
        proposees = ecartees = 0
        cibles = [p for p in images if not gps_exif(p)][: req.maximum]
        for i, p in enumerate(cibles):
            suivi(f"Claude analyse {i + 1}/{len(cibles)} · {p.name}", (i + 1) / max(1, len(cibles)))
            if base.empreinte(p) in deja:
                continue
            try:
                carac = moteur.caracteristiques(p)
                local = moteur.predire(carac)
                avis = claude.analyser(p, local)
            except Exception as e:
                if "limite" in str(e).lower():
                    raise
                ecartees += 1
                continue
            # Seules les réponses assez précises valent la peine d'être validées.
            if avis["lat"] is not None and avis["confiance"] >= 0.6 and avis["rayon_km"] <= 5:
                base.proposer(p, carac, avis | {"source_fichier": str(p)})
                proposees += 1
            else:
                ecartees += 1
        return {"analysees": len(cibles), "proposees": proposees, "ecartees": ecartees}

    return lancer("Propositions de Claude", travail)


class Banque(BaseModel):
    zones: list[str]
    par_zone: int = 300


@app.get("/api/banque/zones")
def zones_banque():
    from .panoramax import ZONES
    return [{"cle": k, "nom": v[0], "bbox": v[1]} for k, v in ZONES.items()]


@app.post("/api/banque")
def banque(req: Banque):
    """Banque clé en main : images de rue Panoramax avec position GPS, pour les zones choisies."""
    from . import panoramax
    zones = [z for z in req.zones if z in panoramax.ZONES]
    if not zones:
        raise HTTPException(400, "Choisissez au moins une zone.")
    n = max(10, min(2000, req.par_zone))
    return lancer("Banque Panoramax", lambda suivi: panoramax.importer(moteur, zones, n, suivi=suivi))


@app.get("/api/propositions")
def liste_propositions():
    return base.propositions()


@app.post("/api/propositions/{ident}/valider")
def valider_proposition(ident: str, pos: Position):
    r = base.retirer_proposition(ident)
    if not r:
        raise HTTPException(404, "Proposition introuvable.")
    ligne, photo, f = r
    ex = base.ajouter(photo, pos.lat, pos.lon, "claude_valide", np.load(f),
                      note=ligne["analyse"].get("lieu", ""), empreinte=base.empreinte(photo))
    photo.unlink(missing_ok=True)
    f.unlink(missing_ok=True)
    return ex


@app.delete("/api/propositions/{ident}")
def rejeter_proposition(ident: str):
    r = base.retirer_proposition(ident)
    if not r:
        raise HTTPException(404, "Proposition introuvable.")
    r[1].unlink(missing_ok=True)
    r[2].unlink(missing_ok=True)
    return {"ok": True}


# ---------- exemples & entraînement ----------
@app.get("/api/exemples")
def liste_exemples():
    return base.exemples()


@app.delete("/api/exemples/{ident}")
def supprimer_exemple(ident: str):
    if not base.supprimer(ident):
        raise HTTPException(404, "Exemple introuvable.")
    return {"ok": True}


@app.post("/api/entrainer")
def entrainer():
    from .entrainement import entrainer as fn
    return lancer("Entraînement", lambda suivi: fn(moteur, suivi=suivi))


@app.post("/api/charger")
def charger():
    """Charge GeoCLIP en arrière-plan (premier lancement : téléchargement d'environ 1,7 Go)."""
    if moteur.pret():
        return {"ok": True}
    def travail(suivi):
        suivi("Chargement de GeoCLIP (premier lancement : téléchargement d'environ 1,7 Go)…", 0.1)
        moteur.b
        suivi("Préparation des 100 000 positions de référence…", 0.6)
        moteur.charger()
        suivi("Modèle prêt", 1.0)
        return None

    return lancer("Chargement du modèle", travail)


# ---------- fichiers ----------
app.mount("/photos", StaticFiles(directory=PHOTOS), name="photos")
app.mount("/attente", StaticFiles(directory=ATTENTE), name="attente")
app.mount("/televersements", StaticFiles(directory=TELEV), name="televersements")


@app.get("/")
def accueil():
    return FileResponse(STATIC / "index.html")
