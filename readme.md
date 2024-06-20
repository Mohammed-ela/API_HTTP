
# Projet API HTTP

Ce projet est une API simple pour gérer des abonnements, construite avec Node.js et Express. Les données des abonnements sont stockées dans une BDD MYSQL.

## Structure du Projet

```
project-root/
├── app.js
├── controllers/
│   └── abonnementsController.js
├── models/
│   └── abonnement.js
├── routes/
│   └── abonnements.js
└── data/
    └── abonnements.json

```

## Prérequis

- Node.js 
- npm 

## Installation

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/Mohammed-ela/API_HTTP
   ```

2. Naviguez dans le répertoire du projet :
   ```bash
   cd back_end
   ```

3. Installez les dépendances :
   ```bash
   npm install
   ```

## Démarrer le Serveur

Pour démarrer le serveur, exécutez la commande suivante :
```bash
npm start
```

Le serveur devrait maintenant être en ligne sur `http://localhost:5000`.

## Routes Disponibles

### Obtenir tous les abonnements

- **URL** : `/abonnements`
- **Méthode** : `GET`
- **Description** : Retourne la liste de tous les abonnements.
- **Exemple de réponse** :
  ```json
  [
      {
          "id": 1,
          "name": "",
          "price": ,
          "duration": "",
          "description": "",
          "features": [
              "A",
              "B",
              "C"
          ],
          "communityAccess": {
              "Discord": true,
              "Facebook": true
          }
      },
      {
          "id": 2,
          "name": "",
          "price": ,
          "duration": "",
          "description": "",
          "features": [
              "A",
              "B",
              "C",
              "D"
          ],
          "communityAccess": {
              "Discord": true,
              "Facebook": true
          }
      }
  ]
  ```

### Obtenir un abonnement par ID

- **URL** : `/abonnements/:id`
- **Méthode** : `GET`
- **Description** : Retourne les détails d'un abonnement spécifique par son ID.
- **Exemple de réponse** :
  ```json
    {
          "id": 1,
          "name": "",
          "price": ,
          "duration": "",
          "description": "",
          "features": [
              "A",
              "B",
              "C"
          ],
          "communityAccess": {
              "Discord": true,
              "Facebook": true
          }
    }
  ```

### Gestion des users

- **URL** : `/users`
- **Méthode** : `POST`
- **Description** :
- **Exemple de réponse** :
  EN COURS


### Page static GET (cgu cgv etc)

- **URL** : `/actualite`
- **Méthode** : `GET`
- **Description** :
- **Exemple de réponse** :
  EN COURS

## Fichiers Importants

### `app.js`

Le point d'entrée de l'application. Il configure le serveur Express et définit les routes principales.

### `routes/abonnements.js`

Contient les routes pour gérer les abonnements. Lit les données depuis le fichier JSON et les retourne en réponse aux requêtes.

### `data/abonnements.json`

Contient les données des abonnements en format JSON.

## Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.
