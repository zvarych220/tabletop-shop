import { useState, useCallback } from 'react'
import { AdminContext } from '../context/AdminContext.js'
import { api } from '../services/api.js'
import useAuth from '../hooks/useAuth.js'

export default function AdminProvider({ children }) {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Check if current user is admin or manager
  const isAdmin = user?.role === 'admin'
  const isManager = user?.role === 'manager' || user?.role === 'admin'

  // Fetch users (admin only)
  const fetchUsers = useCallback(async (params = {}) => {
    if (!isAdmin) return

    setIsLoading(true)
    setError(null)
    try {
      const data = await api.admin.getUsers(params)
      setUsers(data)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [isAdmin])

  // Fetch analytics (admin/manager)
  const fetchAnalytics = useCallback(async () => {
    if (!isManager) return

    setIsLoading(true)
    setError(null)
    try {
      const data = await api.admin.getAnalytics()
      setAnalytics(data)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [isManager])

  // Update user role (admin only)
  const updateUserRole = useCallback(async (userId, role) => {
    if (!isAdmin) {
      throw new Error('Only administrators can change user roles')
    }

    setIsLoading(true)
    setError(null)
    try {
      const updatedUser = await api.admin.updateUserRole(userId, role)
      setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u))
      return updatedUser
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [isAdmin])

  const value = {
    admin: user, // Use user from AuthProvider
    isAdmin,
    isManager,
    users,
    analytics,
    isLoading,
    error,
    fetchUsers,
    fetchAnalytics,
    updateUserRole,
  }

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}
