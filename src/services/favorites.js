const FAVORITES_KEY = 'trading_app_favorites'

export function loadFavorites() {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(item => typeof item === 'string')
  } catch {
    return []
  }
}

export function saveFavorites(favorites) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  } catch {}
}

export function toggleFavorite(symbol) {
  const favorites = loadFavorites()
  const index = favorites.indexOf(symbol)
  
  if (index > -1) {
    favorites.splice(index, 1)
  } else {
    favorites.push(symbol)
  }
  
  saveFavorites(favorites)
  return favorites
}

export function isFavorite(symbol) {
  const favorites = loadFavorites()
  return favorites.includes(symbol)
}

