"""Tests sans GeoCLIP réel : un faux encodeur rend tout le circuit vérifiable hors ligne.

Lancer : python -m pytest tests -q
"""
import io
import os
import sys
import tempfile
from pathlib import Path

os.environ["ORBE_DONNEES"] = tempfile.mkdtemp(prefix="orbe-test-")
os.environ["ORBE_CHARGER_AU_DEMARRAGE"] = "0"
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import numpy as np
import torch
from PIL import Image

from orbe import base, geo
from orbe import serveur
from orbe.moteur import Moteur


class FauxBackend:
    """La « vision » du faux CLIP : la couleur moyenne de l'image, projetée en 768 dimensions."""

    def __init__(self):
        g = torch.Generator().manual_seed(1)
        self.device = "cpu"
        self.proj = torch.randn(3, 768, generator=g)
        self.tete_base = torch.nn.Sequential(torch.nn.Linear(768, 768), torch.nn.ReLU(), torch.nn.Linear(768, 512))
        rff = torch.randn(2, 256, generator=g) * 3
        self.loc = lambda c: torch.cat([torch.sin(c / 10 @ rff), torch.cos(c / 10 @ rff)], 1)
        self.echelle = 30.0
        self.galerie = torch.cat([torch.rand(3000, 2) * torch.tensor([140.0, 340.0]) - torch.tensor([60.0, 170.0]),
                                  torch.tensor([[48.84, 2.24], [48.82, 2.27], [45.76, 4.83]])]).float()

    def clip(self, images):
        x = torch.tensor([np.asarray(im.resize((8, 8)), dtype=np.float32).mean((0, 1)) / 255 for im in images])
        return x @ self.proj


def photo(couleur, gps=None):
    im = Image.new("RGB", (64, 48), couleur)
    buf = io.BytesIO()
    if gps:
        ex = Image.Exif()
        def dms(v):
            v = abs(v); d = int(v); m = int((v - d) * 60); s = (v - d - m / 60) * 3600
            return (d, m, round(s, 4))
        ex.get_ifd(0x8825).update({1: "N" if gps[0] >= 0 else "S", 2: dms(gps[0]), 3: "E" if gps[1] >= 0 else "W", 4: dms(gps[1])})
        im.save(buf, "JPEG", exif=ex)
    else:
        im.save(buf, "JPEG")
    return buf.getvalue()


def test_gps_exif_et_regroupement(tmp_path):
    f = tmp_path / "a.jpg"
    f.write_bytes(photo((10, 20, 30), (48.8397, -2.2399)))
    lat, lon = geo.gps_exif(f)
    assert abs(lat - 48.8397) < 1e-3 and abs(lon + 2.2399) < 1e-3
    g = geo.regrouper([(48.84, 2.24, .5), (48.841, 2.241, .3), (45.76, 4.83, .2)])
    assert len(g) == 2 and abs(g[0]["proba"] - .8) < 1e-6
    assert abs(geo.distance_km(48.8566, 2.3522, 45.764, 4.8357) - 391.5) < 2


def test_circuit_complet(tmp_path):
    from fastapi.testclient import TestClient

    serveur.moteur = Moteur(FauxBackend)
    c = TestClient(serveur.app)
    assert c.post("/api/charger").status_code == 200
    import time
    while c.get("/api/tache").json()["en_cours"]:
        time.sleep(.05)

    # 1. Import : 30 photos dont la couleur dépend du lieu, 2 sans GPS
    rng = np.random.default_rng(0)
    dossier = tmp_path / "photos"
    dossier.mkdir()
    for i in range(30):
        lat, lon = 48.80 + rng.random() * .08, 2.20 + rng.random() * .1
        coul = (int((lat - 48.8) / .08 * 255), int((lon - 2.2) / .1 * 255), 128)
        (dossier / f"p{i}.jpg").write_bytes(photo(coul, (lat, lon)))
    (dossier / "sans1.jpg").write_bytes(photo((200, 10, 10)))
    (dossier / "sans2.jpg").write_bytes(photo((10, 200, 10)))
    assert c.post("/api/importer", json={"dossier": str(dossier)}).status_code == 200
    while c.get("/api/tache").json()["en_cours"]:
        time.sleep(.05)
    r = c.get("/api/tache").json()["resultat"]
    assert r == {"vues": 32, "ajoutees": 30, "sans_gps": 2, "doublons": 0, "erreurs": 0}, r
    # Réimporter ne crée pas de doublons
    c.post("/api/importer", json={"dossier": str(dossier)})
    while c.get("/api/tache").json()["en_cours"]:
        time.sleep(.05)
    assert c.get("/api/tache").json()["resultat"]["doublons"] == 30

    # 2. Analyse sans Claude d'une photo très proche d'un exemple
    r = c.post("/api/analyser", files={"photo": ("x.jpg", (dossier / "p3.jpg").read_bytes(), "image/jpeg")},
               data={"avec_claude": "false"}).json()
    assert r["final"]["par"] == "local" and r["local"]["candidats"]
    assert r["local"]["poids_exemples"] > 0.5  # même image : les exemples dominent
    vrai = geo.gps_exif(dossier / "p3.jpg")
    assert geo.distance_km(*vrai, r["final"]["lat"], r["final"]["lon"]) < 10
    assert r["gps_photo"] is not None

    # 3. Validation d'une analyse corrigée ; la même photo deux fois est refusée
    nouvelle = c.post("/api/analyser", files={"photo": ("y.jpg", photo((1, 2, 3)), "image/jpeg")}, data={"avec_claude": "false"}).json()
    assert c.post(f"/api/analyses/{nouvelle['id']}/valider", json={"lat": 48.83, "lon": 2.25}).status_code == 200
    assert c.post(f"/api/analyses/{nouvelle['id']}/valider", json={"lat": 48.83, "lon": 2.25}).status_code == 409
    assert c.post(f"/api/analyses/{nouvelle['id']}/valider", json={"lat": 123, "lon": 2}).status_code in (409, 422, 500)
    assert c.get("/api/etat").json()["n_exemples"] == 31

    # 4. Entraînement : rapport honnête avant/après, sur des photos de test séparées
    assert c.post("/api/entrainer").status_code == 200
    assert c.post("/api/entrainer").status_code == 409  # une seule tâche à la fois
    while c.get("/api/tache").json()["en_cours"]:
        time.sleep(.05)
    t = c.get("/api/tache").json()
    assert t["erreur"] is None, t
    rap = t["resultat"]
    assert rap["n_test"] >= 2 and rap["n_entrainement"] + rap["n_test"] == 31
    assert rap["garde"] == (rap["mediane_km_apres"] < rap["mediane_km_avant"])
    etat = c.get("/api/etat").json()
    assert etat["tete"] == ("réentraînée" if rap["garde"] else "base")
    print("entraînement :", rap)

    # 5. Propositions de Claude (Claude simulé), validation et rejet
    from orbe import claude
    claude.mode = lambda: "api"
    claude.analyser = lambda p, local: {"statut": "ok", "lieu": "Test", "ville": "Boulogne", "pays": "France",
                                        "lat": 48.835, "lon": 2.24, "confiance": .8, "rayon_km": .3, "accord_modele": 1,
                                        "indices": [], "textes_lus": [], "resume": "", "via": "api"}
    serveur.claude = claude
    c.post("/api/claude-proposer", json={"dossier": str(dossier), "maximum": 5})
    while c.get("/api/tache").json()["en_cours"]:
        time.sleep(.05)
    assert c.get("/api/tache").json()["resultat"] == {"analysees": 2, "proposees": 2, "ecartees": 0}
    props = c.get("/api/propositions").json()
    assert len(props) == 2
    assert c.post(f"/api/propositions/{props[0]['id']}/valider", json={"lat": 48.836, "lon": 2.241}).status_code == 200
    assert c.delete(f"/api/propositions/{props[1]['id']}").status_code == 200
    assert c.get("/api/propositions").json() == []
    ex = c.get("/api/exemples").json()
    assert len(ex) == 32 and ex[-1]["source"] == "claude_valide" and ex[-1]["lat"] == 48.836

    # 6. Analyse avec Claude : Claude a le dernier mot quand il est sûr
    r = c.post("/api/analyser", files={"photo": ("z.jpg", photo((90, 90, 90)), "image/jpeg")}, data={"avec_claude": "true"}).json()
    assert r["final"]["par"] == "claude" and r["final"]["lat"] == 48.835 and r["final"]["accord"] is True

    # 7. Suppression d'un exemple et page d'accueil
    assert c.delete(f"/api/exemples/{ex[0]['id']}").status_code == 200
    assert c.get("/api/etat").json()["n_exemples"] == 31
    assert "Orbe Local" in c.get("/").text
    assert c.post("/api/analyser", files={"photo": ("a.heic", b"x", "image/heic")}).status_code == 400


def test_normaliser_claude():
    from orbe.claude import normaliser, _extraire_json
    n = normaliser({"statut": "ok", "lat": 48.8, "lon": 2.2, "confiance": 0.2, "rayon_km": 0.001}, None)
    assert n["statut"] == "incertain" and n["rayon_km"] == 0.02
    n = normaliser({"statut": "pas_de_lieu", "lat": 1, "lon": 1, "confiance": .9}, None)
    assert n["lat"] is None
    assert _extraire_json('Voici : {"a": 1} fin')["a"] == 1
