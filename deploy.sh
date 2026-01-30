#!/bin/bash
set -e

echo "🚀 Déploiement Trade Simple"
echo ""

echo "📦 Build..."
npm run build

echo ""
echo "🌐 Déploiement GitHub Pages..."
npx gh-pages -d dist

echo ""
echo "✅ Déployé ! Attends 30s puis visite:"
echo "   https://sudonils42.github.io/trade_simple/"

