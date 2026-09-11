FROM node:20-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code
COPY . .

# Exposer le port configuré dans vite.config.js
EXPOSE 3000

# Lancer Vite en exposant sur le réseau local
CMD ["npm", "run", "dev", "--", "--host"]
