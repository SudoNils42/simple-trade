# Architecture API Professionnelle

## Vue d'ensemble

Le système d'API a été entièrement refactorisé pour être scalable, résilient et professionnel.

## Composants

### 1. ApiManager (`src/services/api-manager.js`)

Gestionnaire centralisé de toutes les requêtes API avec :

**Rate Limiting**
- 2000 requêtes max par heure
- Compteur automatique
- Reset toutes les heures

**Cache multi-niveaux**
- Cache mémoire (Map) pour l'accès rapide
- Cache localStorage pour persistance
- TTL configurable par type de requête

**Circuit Breaker**
- Détecte les pannes d'API
- 3 états : `closed` (normal), `open` (bloqué), `half-open` (test)
- S'ouvre après 10 échecs consécutifs
- Se referme automatiquement après 60s

**Exponential Backoff**
- Retry automatique avec délai exponentiel
- 1s → 2s → 4s → 8s (max 30s)
- Respecte le header `Retry-After` (HTTP 429)

**Timeout**
- 10s max par requête
- Abort automatique si dépassé

### 2. Utilisation dans `api.js`

**WebSockets (temps réel)**
- Yahoo Finance : stocks/indices/forex (~45 symboles)
- Binance : cryptos (5 symboles)
- Reconnexion automatique après 5s

**API Fallback (5 symboles sans WebSocket)**
- Symbols : GC=F, SI=F, CL=F, NG=F, ^GSPC
- Cache : 60s (1 minute)
- Fréquence : toutes les 60s si marché ouvert
- Parallélisé : Promise.allSettled

**Closing Prices (marché fermé)**
- 53 symboles non-crypto
- Batches de 10 avec délai 500ms
- Cache : 300s (5 minutes)
- Retry : 3 tentatives avec exponential backoff
- Durée totale : ~3 secondes

**Historical Data (graphiques)**
- Cache variable selon période :
  - 24h : 60s
  - 7d : 300s (5 min)
  - 1m : 600s (10 min)
  - 1y/all : 3600s (1h)
- Persiste dans localStorage

## Optimisations

### Avant
```
- 53 symboles × 3 tentatives × 1s délai = 159s
- Pas de cache
- Retry arbitraire
- Chunks de 5 sans raison
```

### Après
```
- 53 symboles en 6 batches de 10 = 3s
- Cache localStorage + mémoire
- Exponential backoff intelligent
- Promise.allSettled (erreurs isolées)
```

## Monitoring

**Page Settings → API Stats**
- Cache size : Nombre d'items en cache
- Requests : Compteur sur 1h (max 2000)
- Circuit Breaker : État actuel
- Failed Requests : Nombre d'échecs
- Bouton Clear Cache

## Scalabilité

**1 utilisateur**
- ~60 requêtes/minute (marché ouvert)
- ~53 requêtes au démarrage (marché fermé)

**100 utilisateurs**
- Problème : 6000 requêtes/minute
- Solution recommandée : Backend centralisé
  - 1 serveur qui appelle l'API
  - Cache Redis
  - WebSocket vers les clients
  - 60 requêtes/minute total

## Limites actuelles

L'app est statique (GitHub Pages), donc :
- Chaque client appelle l'API
- Pas de backend centralisé
- Scalabilité limitée à ~10-20 utilisateurs simultanés

Pour une vraie production avec centaines d'utilisateurs :
- **Obligatoire** : Créer un backend Node.js/Python
- Serveur unique qui gère les appels API
- Clients connectés via WebSocket au backend
- Cache centralisé (Redis)

