"""Le modèle local.

Deux sources, fusionnées :
1. GeoCLIP (Vivanco et al., NeurIPS 2023) : compare la photo à 100 000 positions du globe,
   plus les positions de vos propres exemples. Sa « tête » (petite couche au-dessus de CLIP)
   peut être réentraînée sur vos photos, voir entrainement.py.
2. Vos exemples : si la photo ressemble beaucoup à une photo déjà connue, sa position compte.
"""
from __future__ import annotations

import copy
import json
import os
import threading
from pathlib import Path

import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image, ImageOps

from . import base
from .config import MODELE
from .geo import regrouper

TETE = MODELE / "tete.pt"
GALERIE = MODELE / "galerie_base.pt"
METRIQUES = MODELE / "metriques.json"


class GeoCLIPBackend:
    """Accès aux morceaux de GeoCLIP dont on a besoin. Le modèle CLIP (~1,7 Go) est téléchargé au premier lancement."""

    type = "geoclip"

    def __init__(self):
        from geoclip import GeoCLIP
        from geoclip.model.image_encoder import _extract_image_features

        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        torch.set_num_threads(max(1, os.cpu_count() or 1))
        m = GeoCLIP()
        # Orbe ne lit que des images : la partie « texte » de CLIP (~500 Mo en mémoire) est inutile.
        clip = m.image_encoder.CLIP
        for nom in ("text_model", "text_projection"):
            if hasattr(clip, nom):
                delattr(clip, nom)
        self.m = m.to(self.device).eval()
        self._extract = _extract_image_features
        self.tete_base = self.m.image_encoder.mlp
        self.loc = self.m.location_encoder
        self.echelle = float(self.m.logit_scale.exp().item())
        self.galerie = self.m.gps_gallery.detach().cpu().float()

    @torch.no_grad()
    def clip(self, images):
        x = self.m.image_encoder.preprocess_image(images).to(self.device)
        return self._extract(self.m.image_encoder.CLIP.get_image_features(pixel_values=x)).float().cpu()


class Moteur:
    def __init__(self, backend_factory=GeoCLIPBackend):
        self._factory = backend_factory
        self._b = None
        self._verrou = threading.RLock()
        self._tete = None
        self._cache_gal = None  # (clé, coords, embeddings)

    # ---------- chargement ----------
    @property
    def b(self):
        with self._verrou:
            if self._b is None:
                self._b = self._factory()
                self.recharger_tete()
            return self._b

    def pret(self):
        return self._b is not None and hasattr(self, "_emb_base")

    def charger(self):
        with self._verrou:
            ids, coords, _ = base.caracteristiques()
            self.galerie(coords)

    def recharger_tete(self):
        tete = copy.deepcopy(self._b.tete_base).cpu().eval()
        self.tete_source = "base"
        if TETE.exists() and METRIQUES.exists():
            try:
                if json.loads(METRIQUES.read_text(encoding="utf-8")).get("garde"):
                    tete.load_state_dict(torch.load(TETE, map_location="cpu", weights_only=True))
                    self.tete_source = "réentraînée"
            except Exception:
                self.tete_source = "base"
        self._tete = tete

    # ---------- caractéristiques ----------
    def caracteristiques_images(self, images) -> np.ndarray:
        """Vecteurs CLIP (n, 2, 768) d'une liste d'images PIL, calculés en un seul lot."""
        vues = []
        for im in images:
            vues += [im, ImageOps.mirror(im)]
        with self._verrou:
            f = self.b.clip(vues)
        return f.numpy().astype(np.float32).reshape(len(images), 2, -1)

    def caracteristiques(self, chemin: Path) -> np.ndarray:
        """Vecteurs CLIP (2, 768) : la photo et son miroir (le miroir sert à l'entraînement)."""
        with Image.open(chemin) as im:
            im = ImageOps.exif_transpose(im).convert("RGB")
            with self._verrou:
                f = self.b.clip([im, ImageOps.mirror(im)])
        return f.numpy().astype(np.float32)

    @torch.no_grad()
    def embed_lieux(self, coords: torch.Tensor) -> torch.Tensor:
        out = []
        for i in range(0, len(coords), 4096):
            out.append(F.normalize(self.b.loc(coords[i:i + 4096].to(self.b.device)).float().cpu(), dim=1))
        return torch.cat(out) if out else torch.zeros((0, 512))

    def _galerie_base(self):
        """Encodage des 100 000 points GeoCLIP (une quinzaine de secondes), gardé sur disque."""
        if GALERIE.exists() and getattr(self._b, "type", "") == "geoclip":
            try:
                emb = torch.load(GALERIE, map_location="cpu", weights_only=True)
                if emb.shape == (len(self.b.galerie), 512):
                    return emb
            except Exception:
                pass
        emb = self.embed_lieux(self.b.galerie)
        if getattr(self._b, "type", "") == "geoclip":
            torch.save(emb, GALERIE)
        return emb

    def galerie(self, coords_perso: np.ndarray):
        """Galerie = 100 000 points GeoCLIP + positions de vos exemples. Mise en cache."""
        cle = coords_perso.round(5).tobytes()
        if self._cache_gal and self._cache_gal[0] == cle:
            return self._cache_gal[1], self._cache_gal[2]
        if not hasattr(self, "_emb_base"):
            self._emb_base = self._galerie_base()
        perso = torch.from_numpy(coords_perso) if len(coords_perso) else torch.zeros((0, 2))
        coords = torch.cat([self.b.galerie, perso])
        emb = torch.cat([self._emb_base, self.embed_lieux(perso)]) if len(perso) else self._emb_base
        self._cache_gal = (cle, coords, emb)
        return coords, emb

    # ---------- prédiction ----------
    @torch.no_grad()
    def predire(self, carac: np.ndarray, top=300, exclure_id=None):
        with self._verrou:
            ids, coords_ex, feats_ex = base.caracteristiques()
            if exclure_id in ids:
                k = ids.index(exclure_id)
                ids = ids[:k] + ids[k + 1:]
                coords_ex = np.delete(coords_ex, k, 0)
                feats_ex = np.delete(feats_ex, k, 0)
            coords, emb = self.galerie(coords_ex)
            img = F.normalize(self._tete(torch.from_numpy(carac[:1])), dim=1)
            probs = (self.b.echelle * img @ emb.T).softmax(-1)[0]
            p, idx = probs.topk(min(top, len(probs)))
            points_gc = [(float(coords[i, 0]), float(coords[i, 1]), float(w)) for w, i in zip(p, idx)]

        # Ressemblance avec vos photos (cosinus des vecteurs CLIP)
        voisins, alpha = [], 0.0
        if len(ids):
            q = carac[0] / (np.linalg.norm(carac[0]) + 1e-9)
            m = feats_ex[:, 0] / (np.linalg.norm(feats_ex[:, 0], axis=1, keepdims=True) + 1e-9)
            sims = m @ q
            ordre = np.argsort(-sims)[:5]
            voisins = [{"id": ids[i], "lat": float(coords_ex[i, 0]), "lon": float(coords_ex[i, 1]), "similarite": float(sims[i])} for i in ordre]
            # Au-dessus de 0,80 la photo ressemble vraiment à un lieu connu ; à 0,95 c'est quasi le même cadrage.
            alpha = float(np.clip((sims[ordre[0]] - 0.80) / 0.15, 0, 1) * 0.85)

        points = [(la, lo, w * (1 - alpha)) for la, lo, w in points_gc]
        if alpha > 0:
            s = np.array([v["similarite"] for v in voisins])
            w = np.exp((s - s.max()) / 0.02)
            w = w / w.sum()
            points += [(v["lat"], v["lon"], float(wi) * alpha) for v, wi in zip(voisins, w)]

        groupes = regrouper(points, rayon_km=15.0, max_groupes=4)
        for g in groupes:
            # Rond = étalement des points du groupe, jamais moins de 150 m.
            g["rayon_km"] = round(max(0.15, 1.5 * g["etalement_km"]), 3)
            g["lat"], g["lon"] = round(g["lat"], 6), round(g["lon"], 6)
            g["proba"] = round(g["proba"], 4)
            del g["poids"], g["etalement_km"]
        return {"candidats": groupes, "voisins": voisins, "poids_exemples": round(alpha, 3),
                "tete": self.tete_source, "n_exemples": len(ids)}
