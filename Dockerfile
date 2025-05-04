# Utiliser une image Node.js officielle comme base avec support multi-architecture
FROM node:18-alpine

# Créer le répertoire de l'application
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY src/package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code source
COPY src .

# Créer le répertoire data s'il n'existe pas
RUN mkdir -p data

# Exposer le port si nécessaire (à ajuster selon vos besoins)
# EXPOSE 3000

# Commande pour démarrer l'application
CMD ["npm", "start"] 