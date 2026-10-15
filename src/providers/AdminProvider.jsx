import { useState, useCallback } from 'react'
import { AdminContext } from '../context/AdminContext.js'
import { admins } from '../data/users.js'

export default function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem('admin')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = useCallback(async (email, password) => {
    setIsLoading(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const foundAdmin = admins.find(
        (a) => a.email === email && a.password === password
      )

      if (!foundAdmin) {
        throw new Error('Невірний email або пароль')
      }

      setAdmin(foundAdmin)
      localStorage.setItem('admin', JSON.stringify(foundAdmin))
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setAdmin(null)
    localStorage.removeItem('admin')
  }, [])

  const value = {
    admin,
    isLoading,
    error,
    login,
    logout,
  }

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}
