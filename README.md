# PyPrépa

Application de révision d'informatique pour classes préparatoires : parcours d'exercices,
exécution réelle de Python dans le navigateur, comptes élèves, panneau d'administration,
et assistance IA passant par une clé Anthropic unique gérée par l'administrateur.

## Installation

```bash
npm install
cp .env.example .env      # puis édite .env
npm start
```

L'application écoute sur `http://localhost:3000`.

Node 18 minimum. `better-sqlite3` se compile à l'installation : sur un serveur nu,
installe `build-essential` et `python3` avant `npm install`.

## Premier démarrage

- Le contenu pédagogique initial est installé automatiquement : 7 unités, 19 leçons,
  98 exercices, 19 fiches, un glossaire, une table des complexités, des extraits de code.
- Un compte administrateur est créé à partir de `ADMIN_EMAIL` et `ADMIN_PASSWORD`.
  Si tu n'as rien renseigné, c'est `admin@local` / `admin1234` : change-le immédiatement
  depuis Profil › Mon compte › Changer de mot de passe.

## Comptes

Chaque compte est identifié par une adresse e-mail et un mot de passe. Le mot de passe
est stocké haché avec bcrypt, jamais en clair. La session repose sur un jeton signé
valable soixante jours.

Deux rôles : `student` et `admin`. Un administrateur voit un onglet supplémentaire.

Depuis Admin › Comptes, tu peux créer un compte, renommer, changer le rôle, désactiver,
réinitialiser un mot de passe, remettre une progression à zéro, supprimer.

Depuis Admin › Réglages, tu peux fermer les inscriptions : plus personne ne peut créer
de compte, seuls ceux que tu crées fonctionnent. C'est le mode conseillé pour une classe.

## Clé API partagée

Admin › Réglages › Clé API Anthropic. La clé est enregistrée côté serveur et n'est
jamais transmise au navigateur. Tous les appels d'assistance (indices, relecture de code,
chat, explication d'erreur, analyse de complexité) transitent par `/api/ai`, qui injecte
la clé et applique un quota par élève et par jour, réglable au même endroit.

Tu peux aussi couper l'assistance IA d'un seul geste : les boutons correspondants
disparaissent alors de l'interface élève.

## Contenu

Admin › Contenu : créer une unité, y ajouter des leçons, éditer les exercices d'une leçon.
Un exercice est un objet JSON. Cinq types :

```jsonc
{"t":"qcm","q":"Question ?","code":"optionnel","choices":["a","b","c","d"],"a":0,"ex":"Explication."}
{"t":"gaps","q":"Consigne","code":"x = ___","bank":["1","2","3","4"],"a":["1"],"ex":"Explication."}
{"t":"order","q":"Consigne","lines":["def f():","    return 1"],"ex":"Explication."}
{"t":"free","q":"Consigne","sol":"x = 1","accept":["variante"],"ex":"Explication."}
{"t":"code","q":"Consigne","starter":"def f(x):\n    ","tests":[{"call":"f(2)","expect":"4"}],"sol":"…","ex":"…"}
```

- `a` d'un QCM est l'indice entier de la bonne réponse.
- `lines` d'un `order` sont dans le bon ordre, avec l'indentation réelle.
- `expect` d'un `code` est la représentation Python du résultat attendu (`'abc'` pour une chaîne).
- Le bouton « Insérer un modèle » remplit l'éditeur avec un exemple de chaque type.

Admin › Ressources : fiches de révision (associées à une unité par son slug), glossaire,
table des complexités, extraits de code, astuces du jour.

Une leçon ou une unité peut être masquée sans être supprimée.

## Exécution du code Python

Les exercices de type `code` chargent Pyodide depuis jsDelivr et exécutent réellement
le code de l'élève contre les tests. Si le CDN est inaccessible, la correction bascule
sur l'IA. Le bac à sable utilise le même moteur.

## Base de données

SQLite, un seul fichier, chemin dans `DB_PATH` (`./data/pyprepa.db` par défaut).
Sauvegarde : copie ce fichier, ainsi que `-wal` et `-shm` s'ils existent, serveur arrêté.

Tables : `users`, `units`, `lessons`, `resources`, `settings`, `logs`.

## Mise en production

Fais tourner l'application derrière un reverse proxy en HTTPS (Caddy, nginx). Sans TLS,
les mots de passe circulent en clair sur le réseau.

Renseigne un `JWT_SECRET` long et aléatoire : le changer déconnecte tout le monde.

```bash
# exemple de service systemd
[Service]
WorkingDirectory=/opt/pyprepa
ExecStart=/usr/bin/node server/index.js
EnvironmentFile=/opt/pyprepa/.env
Restart=always
```

## Limites assumées

- Pas de vérification d'adresse e-mail ni de réinitialisation de mot de passe en autonomie :
  c'est l'administrateur qui réinitialise.
- Pas de chiffrement au repos de la clé API : quiconque a accès au fichier de base ou au
  serveur peut la lire. Restreins les droits sur `data/`.
- Le classement de la ligue est simulé côté navigateur, il ne compare pas les élèves entre eux.
