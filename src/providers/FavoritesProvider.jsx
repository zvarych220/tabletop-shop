import { useState, useEffect, useMemo, useCallback } from 'react'
import { FavoritesContext } from '../context/FavoritesContext.js'
import { mockFavoritesService } from '../services/mockFavoritesService.js'
import useAuth from '../hooks/useAuth.js'

export default function FavoritesProvider({ children }) {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const userId = user?.id || null

  useEffect(() => {
    async function loadFavorites() {
      setIsLoading(true)
      try {
        const data = await mockFavoritesService.getFavorites(userId)
        setFavorites(data)
      } catch (error) {
        console.error('Failed to load favorites:', error)
        setFavorites([])
      } finally {
        setIsLoading(false)
      }
    }
    loadFavorites()
  }, [userId])

  const toggleFavorite = useCallback(
    async (gameId) => {
      try {
        const result = await mockFavoritesService.toggleFavorite(userId, gameId)
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
    [userId]
  )

  const isFavorite = useCallback(
    (gameId) => {
      return favorites.includes(gameId)
    },
    [favorites]
  )

  const clearFavorites = useCallback(async () => {
    try {
      await mockFavoritesService.clearFavorites(userId)
      setFavorites([])
    } catch (error) {
      console.error('Failed to clear favorites:', error)
      throw error
    }
  }, [userId])

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
