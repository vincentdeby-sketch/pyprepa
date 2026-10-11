"""Démarre Orbe Local et ouvre le navigateur."""
import os

# Téléchargement classique du modèle : l'outil rapide de HuggingFace (Xet) réserve
# beaucoup de mémoire d'un coup et plante sur les PC qui en ont peu.
os.environ.setdefault("HF_HUB_DISABLE_XET", "1")
os.environ.setdefault("HF_HUB_ENABLE_HF_TRANSFER", "0")
os.environ.setdefault("HF_HUB_DOWNLOAD_TIMEOUT", "60")

import threading
import webbrowser

import uvicorn

from orbe.config import PORT

if __name__ == "__main__":
    url = f"http://127.0.0.1:{PORT}"
    print(f"Orbe Local v3 : ouvrez {url} dans votre navigateur  (Ctrl+C pour arrêter)")
    print("Chargement du modèle… (premier lancement : téléchargement d'environ 1,7 Go)")
    threading.Timer(1.5, lambda: webbrowser.open(url)).start()
    uvicorn.run("orbe.serveur:app", host="127.0.0.1", port=PORT, log_level="warning")
