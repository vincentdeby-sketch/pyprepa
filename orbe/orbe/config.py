"""Chemins et réglages. Tout ce qui est appris ou importé vit dans DONNEES."""
import os
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
DONNEES = Path(os.environ.get("ORBE_DONNEES", RACINE / "donnees"))
PHOTOS = DONNEES / "photos"          # copies des photos connues (avec position)
ATTENTE = DONNEES / "a_valider"       # photos dont la position est proposée, pas encore validée
MODELE = DONNEES / "modele"           # poids réentraînés + métriques
BASE = DONNEES / "exemples.json"      # la base d'exemples (une ligne par photo)

for d in (PHOTOS, ATTENTE, MODELE):
    d.mkdir(parents=True, exist_ok=True)

PORT = int(os.environ.get("ORBE_PORT", "8765"))

# Claude : clé API si présente, sinon la commande `claude` (Claude Code) de ce PC.
CLAUDE_MODELE = os.environ.get("ORBE_CLAUDE_MODELE", "claude-opus-5-5")
CLAUDE_EFFORT = os.environ.get("ORBE_CLAUDE_EFFORT", "medium")
