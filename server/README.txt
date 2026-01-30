DÉPLOIEMENT BACKEND SUR VERCEL
================================

1. Installation Vercel CLI
   npm install -g vercel

2. Login Vercel
   vercel login

3. Déploiement
   cd server
   vercel
   
   Questions:
   - Setup and deploy? Y
   - Which scope? [ton compte]
   - Link to existing project? N
   - Project name? trade-simple-backend
   - Directory? ./   (appuie Entrée)
   - Override settings? N

4. Récupère l'URL
   Vercel donne: https://trade-simple-backend-xxx.vercel.app

5. Mets à jour frontend
   Édite .env.production.local:
   VITE_BACKEND_URL=https://trade-simple-backend-xxx.vercel.app

6. Redéploie frontend
   cd ..
   ./deploy.sh

HEALTH CHECK
============
curl https://trade-simple-backend-xxx.vercel.app/api/health

