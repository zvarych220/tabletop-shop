import { useState, useEffect, useMemo, useCallback } from 'react'
import { FavoritesContext } from '../context/FavoritesContext.js'
import { api } from '../services/api.js'
import useAuth from '../hooks/useAuth.js'

export default function FavoritesProvider({ children }) {
  const { user, isAuthenticated } = useAuth()
  const [favorites, setFavorites] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function loadFavorites() {
      if (!isAuthenticated) {
        setFavorites([])
        return
      }

      setIsLoading(true)
      try {
        const data = await api.favorites.getAll()
        setFavorites(data)
      } catch (error) {
        console.error('Failed to load favorites:', error)
        setFavorites([])
      } finally {
        setIsLoading(false)
      }
    }
    loadFavorites()
  }, [isAuthenticated])

  const toggleFavorite = useCallback(
    async (gameId) => {
      if (!isAuthenticated) {
        throw new Error('Необхідно увійти для додавання в обране')
      }

      try {
        const result = await api.favorites.toggle(gameId)
        if (result.isFavorite) {
          setFavorites((prev) => [...prev, gameId])
        } else {
          setFavorites((prev) => prev.filter((id) => id !== gameId))
        }
        return result
      } catch (error) {
        console.error('Failed to toggle favorite:', error)
        throw error
      }
    },
    [isAuthenticated]
  )

  const isFavorite = useCallback(
    (gameId) => {
      return favorites.includes(gameId)
    },
    [favorites]
  )

  const clearFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      return
    }

    try {
      await api.favorites.clear()
      setFavorites([])
    } catch (error) {
      console.error('Failed to clear favorites:', error)
      throw error
    }
  }, [isAuthenticated])

  const value = useMemo(
    () => ({
      favorites,
      favoritesCount: favorites.length,
      isLoading,
      toggleFavorite,
      isFavorite,
      clearFavorites,
    }),
    [favorites, isLoading, toggleFavorite, isFavorite, clearFavorites]
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}
