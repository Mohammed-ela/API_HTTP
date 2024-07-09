
# Momodev API

Bienvenue dans l'API de Momodev, une solution SaaS pour gérer les actualités, les abonnements, les contacts et les utilisateurs. Ce guide vous fournira toutes les informations nécessaires pour configurer et utiliser l'API.

## Table des matières

- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [Endpoints](#endpoints)
  - [Utilisateurs](#utilisateurs)
  - [Actualités](#actualités)
  - [Abonnements](#abonnements)
  - [Contacts](#contacts)
- [Exemples de requêtes](#exemples-de-requêtes)
- [Technologies utilisées](#technologies-utilisées)

## Installation

Clonez le dépôt depuis GitHub :

\`\`\`bash
git clone https://github.com/votre-utilisateur/momodev-api.git
cd momodev-api
\`\`\`

Installez les dépendances nécessaires :

\`\`\`bash
npm install
\`\`\`

## Configuration

Copiez le fichier `.env.example` en `.env` et modifiez les valeurs en fonction de votre configuration :

\`\`\`bash
cp .env.example .env
\`\`\`

Voici un exemple de ce que pourrait contenir votre fichier `.env` :

\`\`\`
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=youruser
DB_PASS=yourpassword
DB_NAME=yourdatabase
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
EMAIL_ADMIN=admin@example.com
EMAIL_PASS=secret
\`\`\`

## Démarrage

Pour démarrer l'application, utilisez la commande suivante :

\`\`\`bash
npm start
\`\`\`

Votre API sera accessible à l'adresse \`http://localhost:3000\`.

## Endpoints

### Utilisateurs

- **Créer un utilisateur**
  - **POST** `/users/register`
  - Corps de la requête :
    \`\`\`json
    {
      "name": "Nom",
      "email": "email@example.com",
      "password": "motdepasse"
    }
    \`\`\`

- **Connexion d'un utilisateur**
  - **POST** `/users/login`
  - Corps de la requête :
    \`\`\`json
    {
      "email": "email@example.com",
      "password": "motdepasse"
    }
    \`\`\`

### Actualités

- **Récupérer toutes les actualités**
  - **GET** `/actualites`
  
- **Récupérer une actualité par ID**
  - **GET** `/actualites/:id`
  
- **Créer une actualité**
  - **POST** `/actualites`
  - Corps de la requête :
    \`\`\`json
    {
      "title": "Titre de l'actualité",
      "description": "Description de l'actualité",
      "image": "URL de l'image",
      "userOrAdmin": 1
    }
    \`\`\`

### Abonnements

- **Récupérer tous les abonnements**
  - **GET** `/abonnements`
  
- **Récupérer un abonnement par ID**
  - **GET** `/abonnements/:id`
  
- **Créer un abonnement**
  - **POST** `/abonnements`
  - Corps de la requête :
    \`\`\`json
    {
      "userId": 1,
      "plan": "Plan de l'abonnement",
      "status": "active"
    }
    \`\`\`

### Contacts

- **Envoyer un message de contact**
  - **POST** `/contact`
  - Corps de la requête :
    \`\`\`json
    {
      "name": "Nom",
      "email": "email@example.com",
      "subject": "Objet du message",
      "message": "Votre message"
    }
    \`\`\`

## Exemples de requêtes

### Créer un utilisateur

\`\`\`bash
curl -X POST http://localhost:3000/users/register -H "Content-Type: application/json" -d '{
  "name": "Nom",
  "email": "email@example.com",
  "password": "motdepasse"
}'
\`\`\`

### Connexion d'un utilisateur

\`\`\`bash
curl -X POST http://localhost:3000/users/login -H "Content-Type: application/json" -d '{
  "email": "email@example.com",
  "password": "motdepasse"
}'
\`\`\`

### Récupérer toutes les actualités

\`\`\`bash
curl -X GET http://localhost:3000/actualites
\`\`\`

## Technologies utilisées

- Node.js
- Express
- Prisma
- PostgreSQL
- Nodemailer
- Vuelidate (pour la validation côté client)
- Vue.js (pour le frontend)

