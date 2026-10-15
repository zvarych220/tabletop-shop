import { useContext } from 'react'
import { AdminContext } from '../context/AdminContext.js'

export default function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider')
  }
  return context
}
