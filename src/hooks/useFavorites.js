import { useContext } from 'react'
import { FavoritesContext } from '../context/FavoritesContext.js'

export default function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites повинен використовуватися всередині FavoritesProvider')
  }
  return context
}
