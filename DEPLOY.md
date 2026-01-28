# 📱 Guide de Déploiement - Trade Simple

## Option 1 : PWA Web (Recommandé - Gratuit et Simple)

### Étape 1 : Build de l'application
```bash
npm run build
```
Cela crée un dossier `dist/` avec tous les fichiers de production.

### Étape 2 : Déploiement sur Netlify (GRATUIT)

#### Via l'interface web (Plus simple) :
1. Va sur [netlify.com](https://netlify.com) et crée un compte
2. Clique sur "Add new site" → "Deploy manually"
3. Glisse-dépose le dossier `dist/` dans la zone
4. C'est fait ! Tu obtiens une URL du type : `https://votre-app.netlify.app`

#### Via Netlify CLI (Plus rapide) :
```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Se connecter
netlify login

# Déployer
cd dist
netlify deploy --prod
```

### Étape 3 : Installation sur iPhone/Android

**iPhone (Safari)** :
1. Ouvre l'URL dans Safari
2. Clique sur le bouton "Partager" (⬆️)
3. Scroll et clique "Sur l'écran d'accueil"
4. L'app s'installe comme une vraie app !

**Android (Chrome)** :
1. Ouvre l'URL dans Chrome
2. Chrome affiche automatiquement "Installer l'application"
3. Clique sur "Installer"
4. L'app s'installe comme une vraie app !

### Partager l'app :
- Partage simplement l'URL Netlify à tes proches
- Ils peuvent l'installer depuis leur navigateur

---

## Option 2 : App Native (App Store / Play Store)

Si tu veux publier sur les stores officiels (nécessite des comptes développeur payants) :

### Avec Capacitor

1. **Installer Capacitor** :
```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
npx cap init
```

2. **Build et ajouter les plateformes** :
```bash
npm run build
npx cap add ios
npx cap add android
```

3. **iOS** :
```bash
npx cap open ios
# Ouvre Xcode, configure ton compte développeur Apple ($99/an)
# Build et upload sur App Store
```

4. **Android** :
```bash
npx cap open android
# Ouvre Android Studio, crée un compte Google Play ($25 une fois)
# Build et upload sur Play Store
```

---

## Option 3 : Déploiement sur Vercel (Alternative à Netlify)

```bash
# Installer Vercel CLI
npm install -g vercel

# Déployer
vercel --prod
```

---

## 🚀 URLs Utiles

- **Netlify** : https://netlify.com
- **Vercel** : https://vercel.com
- **PWA Builder** : https://pwabuilder.com (pour convertir PWA en apps natives)
- **Capacitor** : https://capacitorjs.com

---

## ⚠️ Note Importante pour la Production

L'app utilise actuellement le proxy Vite pour contourner CORS (Yahoo Finance API).

**En production, ce proxy ne fonctionne pas.**

### Solutions :
1. **Backend proxy** : Créer un backend Node.js simple qui fait les appels API
2. **Service tiers** : Utiliser un service CORS proxy (gratuit : https://corsproxy.io)
3. **API alternative** : Trouver une API sans restriction CORS

Pour l'instant, l'app fonctionne 100% côté client. Pour une vraie production, considère d'ajouter un backend léger.

---

## 📊 Vérifier le Build

Avant de déployer :
```bash
npm run build
cd dist
python3 -m http.server 8080
```
Ouvre http://localhost:8080 et teste l'app.

