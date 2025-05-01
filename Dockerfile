# Utiliser une image Node.js officielle comme base
FROM node:18-alpine

# Créer le répertoire de l'application
WORKDIR /usr/src/app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code source
COPY . .

# Créer le répertoire data s'il n'existe pas
RUN mkdir -p data

# Commande pour démarrer l'application
CMD ["npm", "start"] 