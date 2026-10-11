"""Réentraînement de la tête GeoCLIP sur vos photos.

CLIP reste figé : on ne réentraîne que la petite couche qui transforme l'image en « position »
(768 -> 512). Les vecteurs CLIP des photos sont déjà calculés, donc ça tourne sur un PC sans
carte graphique en quelques minutes.

Règle de vérité : on met de côté environ une photo sur cinq, jamais vue pendant l'entraînement.
On mesure l'erreur médiane (en km) de l'ancienne et de la nouvelle tête sur ces photos.
La nouvelle n'est gardée que si elle fait mieux.
"""
from __future__ import annotations

import copy
import hashlib
import json
import time

import numpy as np
import torch
import torch.nn.functional as F

from . import base
from .geo import distance_km
from .moteur import METRIQUES, TETE, Moteur

MINIMUM = 10


def _test(ident):  # répartition stable : une photo reste toujours du même côté
    return int(hashlib.sha1(ident.encode()).hexdigest(), 16) % 5 == 0


@torch.no_grad()
def _erreurs(tete, feats, coords_vrais, gal_coords, gal_emb, echelle):
    img = F.normalize(tete(torch.from_numpy(feats[:, 0])), dim=1)
    best = (echelle * img @ gal_emb.T).argmax(1)
    pred = gal_coords[best].numpy()
    return [distance_km(a, b, c, d) for (a, b), (c, d) in zip(coords_vrais, pred)]


def entrainer(moteur: Moteur, epoques=40, lr=1e-4, ancrage=1e-2, suivi=lambda msg, frac: None):
    ids, coords, feats = base.caracteristiques()
    if len(ids) < MINIMUM:
        raise ValueError(f"Il faut au moins {MINIMUM} photos avec position pour entraîner (vous en avez {len(ids)}).")
    test = np.array([_test(i) for i in ids])
    if test.sum() < 2:  # petite base : on force 2 photos de test
        test[:] = False
        test[np.arange(len(ids))[-2:]] = True
    tr, te = ~test, test
    b = moteur.b
    torch.manual_seed(0)

    suivi("Préparation de la galerie de positions…", 0.02)
    # Pour juger honnêtement, la galerie contient les positions d'entraînement, pas celles du test.
    with moteur._verrou:
        gal_coords, gal_emb = moteur.galerie(coords[tr])
    tete0 = copy.deepcopy(b.tete_base).cpu().eval()
    for p in tete0.parameters():
        p.requires_grad_(False)
    tete = copy.deepcopy(moteur._tete).cpu().train()
    for p in tete.parameters():
        p.requires_grad_(True)
    ref = [p.detach().clone() for p in tete0.parameters()]

    avant = _erreurs(moteur._tete.eval(), feats[te], coords[te], gal_coords, gal_emb, b.echelle)

    X = torch.from_numpy(feats[tr])            # (n, 2, 768)
    Y = torch.from_numpy(coords[tr])
    emb_y = moteur.embed_lieux(Y)              # positions des photos d'entraînement
    opt = torch.optim.AdamW(tete.parameters(), lr=lr, weight_decay=1e-4)
    n = len(X)
    lot = min(32, n)
    t0 = time.time()
    for ep in range(epoques):
        perm = torch.randperm(n)
        for i in range(0, n, lot):
            j = perm[i:i + lot]
            vue = torch.randint(0, 2, (len(j),))       # photo ou miroir
            x = X[j, vue]
            neg = gal_emb[torch.randint(0, len(b.galerie), (1024,))]  # positions ailleurs sur le globe
            cibles = torch.cat([emb_y[j], neg])
            logits = b.echelle * F.normalize(tete(x), dim=1) @ cibles.T
            perte = F.cross_entropy(logits, torch.arange(len(j)))
            # Ancrage : on reste proche de GeoCLIP pour ne pas oublier le reste du monde.
            perte = perte + ancrage * sum(((p - r) ** 2).sum() for p, r in zip(tete.parameters(), ref))
            opt.zero_grad()
            perte.backward()
            opt.step()
        suivi(f"Époque {ep + 1}/{epoques} · perte {perte.item():.3f}", 0.05 + 0.9 * (ep + 1) / epoques)

    tete.eval()
    apres = _erreurs(tete, feats[te], coords[te], gal_coords, gal_emb, b.echelle)
    med_av, med_ap = float(np.median(avant)), float(np.median(apres))
    garde = med_ap < med_av
    rapport = {
        "garde": garde, "date": time.time(), "duree_s": round(time.time() - t0, 1),
        "n_entrainement": int(tr.sum()), "n_test": int(te.sum()),
        "mediane_km_avant": round(med_av, 3), "mediane_km_apres": round(med_ap, 3),
        "moyenne_km_avant": round(float(np.mean(avant)), 3), "moyenne_km_apres": round(float(np.mean(apres)), 3),
        "sous_1km_avant": int(sum(e < 1 for e in avant)), "sous_1km_apres": int(sum(e < 1 for e in apres)),
    }
    if garde:
        torch.save(tete.state_dict(), TETE)
    # On garde la trace du dernier essai même s'il est rejeté, sans écraser une bonne tête.
    precedent = json.loads(METRIQUES.read_text(encoding="utf-8")) if METRIQUES.exists() else {}
    if not garde and precedent.get("garde"):
        rapport["garde"] = False
        precedent["dernier_essai_rejete"] = rapport
        METRIQUES.write_text(json.dumps(precedent, indent=1), encoding="utf-8")
    else:
        METRIQUES.write_text(json.dumps(rapport, indent=1), encoding="utf-8")
    moteur.recharger_tete()
    suivi("Terminé", 1.0)
    return rapport
