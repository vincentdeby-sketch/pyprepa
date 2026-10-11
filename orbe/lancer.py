"""Démarre Orbe Local et ouvre le navigateur quand le serveur est prêt."""
import os

# Téléchargement classique du modèle : l'outil rapide de HuggingFace (Xet) réserve
# beaucoup de mémoire d'un coup et plante sur les PC qui en ont peu.
os.environ.setdefault("HF_HUB_DISABLE_XET", "1")
os.environ.setdefault("HF_HUB_ENABLE_HF_TRANSFER", "0")
os.environ.setdefault("HF_HUB_DOWNLOAD_TIMEOUT", "60")
os.environ.setdefault("ORBE_OUVRIR_NAVIGATEUR", "1")

if __name__ == "__main__":
    print("Orbe Local v4 : démarrage…")
    print("La première fois, cela peut prendre 1 à 3 minutes sans rien afficher.")
    print("Ne fermez pas cette fenêtre et n'appuyez pas sur Ctrl+C.\n")
    import uvicorn

    from orbe.config import PORT

    uvicorn.run("orbe.serveur:app", host="127.0.0.1", port=PORT, log_level="warning")
