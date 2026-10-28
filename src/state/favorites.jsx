import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react'

const STORAGE_KEY = 'savora-favorites'
const FavoritesContext = createContext(null)

// Favourites are stored as summary objects so the Saved view works without refetching
export function favoritesReducer(state, action) {
  switch (action.type) {
    case 'toggle': {
      const exists = state.some((m) => m.id === action.meal.id)
      if (exists) return state.filter((m) => m.id !== action.meal.id)
      const { id, name, image, area, category } = action.meal
      return [{ id, name, image, area, category }, ...state]
    }
    case 'clear':
      return []
    default:
      return state
  }
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

export function FavoritesProvider({ children, initial }) {
  const [favorites, dispatch] = useReducer(favoritesReducer, initial, (init) => init ?? load())

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
    } catch {
      /* storage blocked: favourites still work for this visit */
    }
  }, [favorites])

  const toggle = useCallback((meal) => dispatch({ type: 'toggle', meal }), [])
  const isFavorite = useCallback((id) => favorites.some((m) => m.id === id), [favorites])

  // useMemo keeps the context value stable, so consumers only re-render when favourites change
  const value = useMemo(() => ({ favorites, toggle, isFavorite }), [favorites, toggle, isFavorite])
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used inside <FavoritesProvider>')
  return ctx
}
