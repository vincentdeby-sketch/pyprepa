"""Démarre Orbe Local et ouvre le navigateur."""
import threading
import webbrowser

import uvicorn

from orbe.config import PORT

if __name__ == "__main__":
    url = f"http://127.0.0.1:{PORT}"
    print(f"Orbe Local : {url}  (Ctrl+C pour arrêter)")
    threading.Timer(1.5, lambda: webbrowser.open(url)).start()
    uvicorn.run("orbe.serveur:app", host="127.0.0.1", port=PORT, log_level="warning")
