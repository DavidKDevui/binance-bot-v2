# Binance Bot

**Binance Bot** est un bot de trading automatisé pour la plateforme Binance, développé en Node.js.
Il permet de surveiller les prix, d'exécuter des ordres d'achat/vente d'ETH contre USDC, de gérer le portefeuille, d'appliquer des stratégies de trading (take profit, stop loss, etc.) et d'envoyer des notifications en temps réel via Pushover.

## Fonctionnalités principales

- **Récupération automatique des prix et historiques** des actifs via l'API officielle Binance.
- **Gestion du portefeuille** : consultation des soldes ETH et USDC.
- **Exécution d'ordres d'achat, de vente et de stop loss** avec gestion intelligente des quantités (respect des règles Binance, gestion des erreurs de solde, etc.).
- **Notifications Pushover** : recevez une alerte sur votre téléphone pour chaque opération (achat, vente, erreur, etc.).
- **Persistance des opérations** dans un fichier JSON.

## Structure du projet

```
.
├── src/
│   ├── app.js                # Point d'entrée principal
│   ├── services/
│   │   ├── assetsService.js      # Gestion des prix et historiques d'actifs
│   │   ├── walletService.js      # Gestion du portefeuille
│   │   ├── operationsService.js  # Exécution des ordres
│   │   ├── pushoverService.js    # Notifications Pushover
│   ├── utils/
│   │   ├── date.js               # Outils de gestion de date
│   │   ├── console.js            # Outils d'affichage console
│   │   └── ...
│   └── data/
│       └── operations.json       # Historique des opérations
├── Dockerfile
├── .dockerignore
├── package.json
├── .env (à créer)
└── README.md
```

## Prérequis

- Node.js 18+
- Un compte Binance avec des clés API
- Un compte Pushover (pour les notifications)
- Docker (optionnel, pour l'exécution en conteneur)


## Configuration

1. **Cloner le dépôt**
2. **Créer un fichier `.env`** à la racine du projet avec :
   ```
   BINANCE_API_KEY=VOTRE_CLE_API
   BINANCE_API_SECRET=VOTRE_SECRET_API

   PUSHOVER_TOKEN=VOTRE_TOKEN_PUSHOVER
   PUSHOVER_USER=VOTRE_USER_PUSHOVER

   START_VALUE=VALEUR_INITIALE_ACHAT
   TAKE_PROFIT=1 
   STOP_LOSS=0.5
   
   ```
3. **Créer un dossier data dans /src**
    ```bash
     mkdir data
    ```
3. **Installer les dépendances**
   ```bash
   npm install
   ```

## Lancer le bot

### En local

```bash
npm start
```
## Avertissement

- Ce bot exécute de vrais ordres sur Binance. Utilisez-le à vos risques et périls.
- Testez toujours sur un compte de test ou avec de petites sommes avant de l'utiliser en production.
