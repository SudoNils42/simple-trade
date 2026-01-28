const FAVORITES_KEY = 'trading_app_favorites'

export function loadFavorites() {
  const stored = localStorage.getItem(FAVORITES_KEY)
  return stored ? JSON.parse(stored) : []
}

export function saveFavorites(favorites) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
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

