# Orbe Local

Retrouver où une photo a été prise, sur une carte satellite, avec un modèle qui tourne sur votre PC,
que vous entraînez avec vos propres photos, et que Claude vérifie.

## Comment ça marche

1. **Le modèle local (GeoCLIP)** compare la photo à 100 000 positions du globe et propose
   jusqu'à 4 zones (ronds jaunes en pointillé). Il est bon pour la région, moins pour l'adresse.
2. **Vos exemples** : si la photo ressemble beaucoup à une photo dont vous connaissez la position,
   cette position compte dans l'estimation (points verts).
3. **Claude** regarde la photo et les propositions du modèle, lit les panneaux, repère
   l'architecture, puis confirme ou corrige (rond bleu). Il a le dernier mot quand il est assez sûr.

## Installation (Windows)

1. Installez **Python 3.12** depuis python.org, en cochant **« Add python.exe to PATH »**.
2. Double-cliquez sur **`lancer.bat`**.
   - Le premier lancement installe les dépendances (quelques minutes), puis télécharge
     le modèle CLIP (environ 1,7 Go, une seule fois).
   - Le navigateur s'ouvre sur http://127.0.0.1:8765.

Pas de carte graphique nécessaire. Avec une carte NVIDIA, installez la version CUDA de PyTorch
(commande sur pytorch.org) dans `.venv` pour aller plus vite.

## Brancher Claude

Orbe choisit tout seul :
- **Claude Code** installé sur ce PC (commande `claude`) : utilise votre abonnement Claude, rien à configurer.
- **Clé API** (facturée à l'usage) : mettez-la dans la variable `ANTHROPIC_API_KEY`
  ou dans le fichier `donnees\cle_api.txt`. Elle est prioritaire si elle existe.

Réglages facultatifs : `ORBE_CLAUDE_MODELE` (par défaut `claude-opus-5-5`), `ORBE_CLAUDE_EFFORT`
(`low`, `medium` par défaut, `high`). Avec la clé API, une relance automatique sur un autre modèle
est activée si un filtre de sécurité refuse une image à tort.

## Entraîner le modèle

Onglet **Entraîner** :
0. **Banque clé en main** : cochez vos zones (Boulogne, Issy, Sèvres, Saint-Cloud, Paris 15e, 16e),
   choisissez le nombre d'images, cliquez « Télécharger la banque ». Orbe récupère des vues de rue
   [Panoramax](https://panoramax.fr) (IGN + OpenStreetMap France, licence libre) avec leur position GPS,
   réparties sur toute la zone et espacées d'au moins 25 m. Les vues 360° sont recadrées en vue avant.
   Comptez environ 2 secondes par image sur un PC sans carte graphique. Puis lancez l'entraînement.
1. **Importer un dossier** de photos qui contiennent leur position GPS (photos de téléphone,
   par exemple vos visites à Boulogne). Les photos sans GPS sont ignorées, les doublons aussi.
2. **Corriger les analyses** : après une analyse, « C'est juste » ou « Corriger sur la carte »
   ajoute la photo à vos exemples.
3. **Claude propose, vous validez** : pour un dossier de photos sans GPS, Claude propose des
   positions. Elles restent en attente tant que vous ne les avez pas validées ou corrigées.
4. **Entraîner sur mes photos** (10 exemples minimum). Une photo sur cinq est mise de côté
   pour le test. Orbe compare l'erreur médiane avant et après, et ne garde la nouvelle version
   que si elle se trompe moins. Le résultat s'affiche en kilomètres.

Ce qui est réentraîné : la petite couche de GeoCLIP qui relie l'image à une position.
CLIP lui-même reste figé, c'est ce qui permet d'entraîner sans carte graphique.

## Vos données

Tout reste dans le dossier `donnees\` : photos d'exemples, propositions en attente, modèle
réentraîné. Rien ne part ailleurs, sauf la photo analysée quand vous demandez l'avis de Claude.
Pour repartir de zéro, supprimez `donnees\modele\tete.pt` (modèle) ou tout `donnees\`.

## Limites à connaître

- La carte satellite (Esri), le nom des lieux (OpenStreetMap) et la banque Panoramax demandent une connexion internet.
- La banque dépend de ce que les contributeurs Panoramax ont photographié : certaines rues n'ont aucune image.
- Le modèle de base est entraîné sur des photos du monde entier : sur un quartier précis,
  il ne devient fiable qu'avec des exemples de ce quartier.
- Les photos HEIC d'iPhone doivent être converties en JPEG.
- Orbe refuse de localiser un domicile privé quand une personne identifiable est le sujet de la photo.

## Tests

```
.venv\Scripts\python -m pip install pytest httpx
.venv\Scripts\python -m pytest tests -q
```
Les tests remplacent GeoCLIP par un faux modèle : ils vérifient tout le circuit (import EXIF,
analyse, corrections, entraînement avec jeu de test, propositions de Claude) sans rien télécharger.
