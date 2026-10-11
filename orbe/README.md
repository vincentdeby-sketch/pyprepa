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

**Orbe apprend tout seul, partout sur Terre.** Deux façons :

- **Apprendre sur place** (onglet Analyser, coché par défaut) : après chaque analyse, Orbe
  télécharge une soixantaine de vues de rue autour de l'estimation, les compare à votre photo et
  refait l'analyse. Si une vue ressemble fortement à votre photo, Orbe donne ce point précis
  (« Vue de rue identique trouvée »). Chaque analyse enrichit la carte : plus vous l'utilisez,
  plus Orbe connaît de rues.
- **Apprendre une zone** (onglet Entraîner) : cherchez un lieu dans la barre en haut, ou déplacez
  la carte. La zone apprise est ce que montre l'écran : un quartier, une ville, un pays. Orbe répartit
  les images sur toute la zone et indique la précision attendue (rue, quartier, ville, région).

Sources des vues de rue, avec position GPS exacte et licence libre :
- [Panoramax](https://panoramax.fr) (IGN + OpenStreetMap France) : très bonne couverture en France, sans clé ;
- [Mapillary](https://www.mapillary.com) : couverture mondiale, clé gratuite à coller dans
  « Clé Mapillary » (compte Mapillary › Developers › Register application › Client Token).

Ensuite, vous pouvez aussi :
1. **Importer un dossier** de vos photos qui contiennent leur position GPS.
2. **Corriger les analyses** : « C'est juste » ou « Corriger sur la carte ».
3. **Claude propose, vous validez** : positions proposées par Claude pour des photos sans GPS.
4. **Entraîner sur mes photos** (10 exemples minimum). Une photo sur cinq est mise de côté pour le
   test ; la nouvelle version n'est gardée que si elle se trompe moins. Les vues de rue servent
   déjà sans entraînement ; l'entraînement améliore surtout la région générale.

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
