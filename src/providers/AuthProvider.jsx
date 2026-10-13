import { useState, useEffect, useMemo } from 'react'
import { AuthContext } from '../context/AuthContext.js'
import { mockAuthService } from '../services/mockAuthService.js'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const currentUser = mockAuthService.getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)
  }, [])

  async function login(email, password) {
    setError(null)
    setIsLoading(true)
    try {
      const loggedInUser = await mockAuthService.login(email, password)
      setUser(loggedInUser)
      return loggedInUser
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  async function register(userData) {
    setError(null)
    setIsLoading(true)
    try {
      const newUser = await mockAuthService.register(userData)
      setUser(newUser)
      return newUser
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  async function logout() {
    setError(null)
    setIsLoading(true)
    try {
      await mockAuthService.logout()
      setUser(null)
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  async function updateProfile(updates) {
    if (!user) {
      throw new Error('Необхідно увійти для оновлення профілю')
    }
    setError(null)
    setIsLoading(true)
    try {
      const updatedUser = await mockAuthService.updateProfile(user.id, updates)
      setUser(updatedUser)
      return updatedUser
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      error,
      login,
      register,
      logout,
      updateProfile,
    }),
    [user, isLoading, error]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
