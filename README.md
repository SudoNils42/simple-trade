# Trade Simple

Application de simulation de trading sur données réelles.

## Installation

```bash
npm install
```

## Configuration API Finnhub

1. Créer un compte gratuit sur [finnhub.io](https://finnhub.io)
2. Récupérer ta clé API
3. Créer un fichier `.env` à la racine :

```
VITE_FINNHUB_API_KEY=ta_cle_api
```

## Lancer l'application

```bash
npm run dev
```

Ouvre http://localhost:5173

## Fonctionnalités

- Liste des actifs principaux (actions US + crypto)
- Prix en temps réel via WebSocket
- Graphiques 30 jours
- Achat/vente simulé
- Portefeuille avec P&L en direct
- Stockage local (pas de compte requis)
- Design Apple-like

## Build production

```bash
npm run build
```

Les fichiers seront dans le dossier `dist/`.
