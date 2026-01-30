# Backend Proxy Yahoo Finance

Backend Node.js/Express pour contourner les limitations CORS de l'API Yahoo Finance.

## Déploiement sur Vercel

### 1. Créer un compte Vercel
- Aller sur [vercel.com](https://vercel.com)
- Se connecter avec GitHub

### 2. Déployer le backend
```bash
cd server
npm install -g vercel
vercel login
vercel --prod
```

### 3. Récupérer l'URL du backend
Après le déploiement, Vercel affichera l'URL (ex: `https://your-project.vercel.app`)

### 4. Configurer le frontend
Créer/modifier `.env.production.local` à la racine du projet :
```
VITE_BACKEND_URL=https://your-project.vercel.app
```

### 5. Déployer le frontend
```bash
npm run deploy
```

## Caractéristiques

- **Cache intelligent** : 60s TTL pour réduire les appels API
- **Rate limiting** : 2000 requêtes/heure
- **CORS** : Activé pour tous les domaines
- **Health check** : `/api/health` pour monitoring

## Endpoints

- `GET /api/yahoo/v8/finance/chart/:symbol?interval=X&range=Y` - Données historiques
- `GET /api/health` - État du serveur

## Limites Vercel (Plan Gratuit)

- **100 GB bandwidth/mois**
- **100 heures serverless/mois**
- **~2M requêtes/mois** (selon durée d'exécution)
- **Cold start** : ~500ms première requête

### Calcul d'utilisateurs

**Scénario type** (1 utilisateur) :
- Ouverture app : 54 assets = ~54 requêtes
- Fallback API : ~15 assets toutes les 30s = 120 req/h
- Charts : ~5 ranges × 10 consultations = 50 req/h
- **Total : ~170 requêtes/heure/utilisateur**

**Limites estimées** :
- Avec cache : **~100-200 utilisateurs actifs simultanés**
- Sans cache : **~30-50 utilisateurs actifs simultanés**

## Monitoring

Vérifier l'état du serveur :
```bash
curl https://your-project.vercel.app/api/health
```

## Upgrade si nécessaire

Si les limites sont atteintes :
- **Vercel Pro** : $20/mois → 1000 GB/mois, fonctions illimitées
- **Backend custom** : AWS Lambda, Railway, Render (gratuit avec limites)

