import { useState, useEffect, useMemo, useCallback } from 'react'
import { AuthContext } from '../context/AuthContext.js'
import { api, getAuthToken } from '../services/api.js'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadUser = async () => {
      const token = getAuthToken()
      if (token) {
        try {
          const response = await api.auth.getMe()
          // api.js handleResponse returns data.data || data
          // /auth/me returns { success, data: { user } } → unwrapped to { user }
          const userData = response?.user || response
          if (userData && userData.id) {
            setUser(userData)
          } else {
            console.warn('Invalid response from /auth/me:', response)
            localStorage.removeItem('authToken')
          }
        } catch (err) {
          console.error('Failed to load user:', err)
          // Only remove token if it's truly invalid (401/403)
          if (err.message?.includes('401') || err.message?.includes('403') || err.message?.includes('авторизація')) {
            localStorage.removeItem('authToken')
          }
        }
      }
      setIsLoading(false)
    }

    loadUser()
  }, [])

  const login = useCallback(async (email, password) => {
    setError(null)
    setIsLoading(true)
    try {
      const response = await api.auth.login({ email, password })
      // api.js handleResponse unwraps data.data || data
      // /auth/login returns { success, data: { user, token } } → unwrapped to { user, token }
      const token = response?.token
      const userData = response?.user
      if (!token || !userData) {
        throw new Error('Сервер повернув некоректну відповідь при вході')
      }
      localStorage.setItem('authToken', token)
      setUser(userData)
      return userData
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (userData) => {
    setError(null)
    setIsLoading(true)
    try {
      const response = await api.auth.register(userData)
      localStorage.setItem('authToken', response.token)
      setUser(response.user)
      return response.user
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setError(null)
    setIsLoading(true)
    try {
      await api.auth.logout()
      localStorage.removeItem('authToken')
      setUser(null)
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateProfile = useCallback(async (updates) => {
    if (!user) {
      throw new Error('Необхідно увійти для оновлення профілю')
    }
    setError(null)
    setIsLoading(true)
    try {
      const response = await api.auth.updateProfile(updates)
      setUser(response.user)
      return response.user
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user])

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
    [user, isLoading, error, login, register, logout, updateProfile]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
