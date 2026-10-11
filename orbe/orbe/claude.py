"""Claude, en second avis du modèle local.

Deux façons de joindre Claude, choisies automatiquement :
- une clé API (variable ANTHROPIC_API_KEY ou fichier donnees/cle_api.txt) : rapide, facturé à l'usage ;
- sinon la commande `claude` (Claude Code installé sur ce PC) : utilise votre abonnement.
"""
from __future__ import annotations

import base64
import json
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

from .config import CLAUDE_EFFORT, CLAUDE_MODELE, DONNEES

SCHEMA = {
    "type": "object",
    "properties": {
        "statut": {"type": "string", "enum": ["ok", "incertain", "pas_de_lieu", "refus_prive"]},
        "lieu": {"type": "string"},
        "ville": {"type": "string"},
        "pays": {"type": "string"},
        "lat": {"type": "number"},
        "lon": {"type": "number"},
        "confiance": {"type": "number"},
        "rayon_km": {"type": "number"},
        "accord_modele": {"type": "integer"},
        "indices": {"type": "array", "items": {"type": "string"}},
        "textes_lus": {"type": "array", "items": {"type": "string"}},
        "resume": {"type": "string"},
    },
    "required": ["statut", "lieu", "ville", "pays", "lat", "lon", "confiance", "rayon_km",
                 "accord_modele", "indices", "textes_lus", "resume"],
    "additionalProperties": False,
}


def _consigne(local: dict | None) -> str:
    lignes = []
    if local and local.get("candidats"):
        lignes.append("Un modèle local de géolocalisation (GeoCLIP, réentraîné sur les photos de l'utilisateur) propose :")
        for i, c in enumerate(local["candidats"], 1):
            lignes.append(f"  {i}. lat {c['lat']:.5f}, lon {c['lon']:.5f} · probabilité {c['proba']:.2f} · rayon {c['rayon_km']:.2f} km")
        if local.get("poids_exemples", 0) > 0.3:
            lignes.append("  La photo ressemble fortement à des photos déjà validées par l'utilisateur près du candidat 1.")
        lignes.append("Ce modèle est bon pour la région générale, faible pour le lieu exact. Vérifie-le avec ce que tu vois.")
    proposition = "\n".join(lignes) or "Aucune proposition du modèle local."
    return f"""Tu es un expert en géolocalisation de photos. Trouve où cette photo a été prise.

{proposition}

Méthode :
- Un monument ou bâtiment connu : donne ses coordonnées exactes et un rayon_km de 0.05 à 0.3.
- Sinon, raisonne sur les indices : architecture, langue des panneaux, plaques, marquages au sol, mobilier urbain, végétation, relief, lumière.
- Lis les textes visibles (textes_lus).
- accord_modele = numéro du candidat local que tu retiens (1, 2…), ou 0 si tu n'en retiens aucun.
- confiance est une vraie probabilité entre 0 et 1. Si tu hésites, mets une valeur basse et statut "incertain".
- rayon_km = taille de la zone où le lieu peut se trouver (rue 0.5, quartier 2, ville 10, région 150).
- Pas de lieu identifiable (gros plan, objet, intérieur banal) : statut "pas_de_lieu".
- Si le sujet principal est une personne identifiable devant un domicile privé : statut "refus_prive", on ne localise pas les domiciles.

Réponds en français, uniquement avec un objet JSON contenant les champs : statut, lieu, ville, pays, lat, lon, confiance, rayon_km, accord_modele, indices, textes_lus, resume."""


def _cle_api():
    cle = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    f = DONNEES / "cle_api.txt"
    if not cle and f.exists():
        cle = f.read_text(encoding="utf-8").strip()
    return cle or None


def mode():
    if _cle_api():
        return "api"
    if shutil.which("claude"):
        return "claude_code"
    return None


def reduire(chemin: Path, dest: Path, cote=1568) -> Path:
    """Copie JPEG redimensionnée : Claude n'en voit pas plus, et l'API refuse les images de plus de 5 Mo."""
    from PIL import Image, ImageOps

    with Image.open(chemin) as im:
        im = ImageOps.exif_transpose(im).convert("RGB")
        im.thumbnail((cote, cote))
        im.save(dest, "JPEG", quality=88)
    return dest


def _par_api(chemin: Path, consigne: str) -> dict:
    import anthropic

    client = anthropic.Anthropic(api_key=_cle_api())
    with tempfile.TemporaryDirectory() as d:
        data = base64.standard_b64encode(reduire(chemin, Path(d) / "photo.jpg").read_bytes()).decode()
    reponse = client.beta.messages.create(
        model=CLAUDE_MODELE,
        max_tokens=16000,
        output_config={"effort": CLAUDE_EFFORT, "format": {"type": "json_schema", "schema": SCHEMA}},
        # Si un filtre de sécurité refuse à tort, l'API relance sur un autre modèle.
        betas=["server-side-fallback-2026-07-01"],
        fallbacks="default",
        messages=[{"role": "user", "content": [
            {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": data}},
            {"type": "text", "text": consigne},
        ]}],
    )
    if reponse.stop_reason == "refusal":
        raise RuntimeError("Claude a refusé d'analyser cette image.")
    texte = next((b.text for b in reponse.content if b.type == "text"), "")
    return json.loads(texte)


def _extraire_json(texte: str) -> dict:
    debut, fin = texte.find("{"), texte.rfind("}")
    if debut < 0 or fin <= debut:
        raise RuntimeError("Réponse de Claude illisible.")
    return json.loads(texte[debut:fin + 1])


def _par_claude_code(chemin: Path, consigne: str) -> dict:
    exe = shutil.which("claude")
    with tempfile.TemporaryDirectory() as d:
        photo = reduire(chemin, Path(d) / "photo.jpg")
        entree = f"Ouvre l'image {photo.name} (dossier courant) avec l'outil Read, puis :\n\n{consigne}"
        # La consigne passe par l'entrée standard : pas de souci de guillemets sous Windows.
        r = subprocess.run(
            [exe, "-p", "Suis exactement les instructions recues sur stdin.",
             "--output-format", "json", "--allowedTools", "Read"],
            input=entree, capture_output=True, text=True, encoding="utf-8", cwd=d, timeout=600,
        )
    if r.returncode != 0:
        msg = (r.stderr or r.stdout or "").strip()[-400:]
        if "limit" in msg.lower():
            raise RuntimeError("Limite d'utilisation de votre compte Claude atteinte. Réessayez plus tard.")
        raise RuntimeError(f"La commande claude a échoué : {msg}")
    enveloppe = json.loads(r.stdout)
    if enveloppe.get("is_error"):
        raise RuntimeError(str(enveloppe.get("result") or "Erreur de Claude Code."))
    return _extraire_json(enveloppe.get("result", ""))


def analyser(chemin: Path, local: dict | None = None) -> dict:
    m = mode()
    if m is None:
        raise RuntimeError("Claude n'est pas configuré : ajoutez une clé API ou installez Claude Code.")
    brut = (_par_api if m == "api" else _par_claude_code)(Path(chemin), _consigne(local))
    return normaliser(brut, local) | {"via": m}


def normaliser(r: dict, local: dict | None) -> dict:
    def nombre(v, defaut=0.0):
        try:
            return float(v)
        except (TypeError, ValueError):
            return defaut
    out = {
        "statut": r.get("statut") if r.get("statut") in ("ok", "incertain", "pas_de_lieu", "refus_prive") else "incertain",
        "lieu": str(r.get("lieu") or ""), "ville": str(r.get("ville") or ""), "pays": str(r.get("pays") or ""),
        "lat": nombre(r.get("lat")), "lon": nombre(r.get("lon")),
        "confiance": min(1.0, max(0.0, nombre(r.get("confiance")))),
        "rayon_km": min(3000.0, max(0.02, nombre(r.get("rayon_km"), 10))),
        "accord_modele": int(nombre(r.get("accord_modele"))),
        "indices": [str(x) for x in (r.get("indices") or [])][:8],
        "textes_lus": [str(x) for x in (r.get("textes_lus") or [])][:8],
        "resume": str(r.get("resume") or ""),
    }
    if not (-90 <= out["lat"] <= 90 and -180 <= out["lon"] <= 180) or out["statut"] in ("pas_de_lieu", "refus_prive"):
        out["lat"] = out["lon"] = None
    elif out["confiance"] < 0.35:
        out["statut"] = "incertain"
    return out
