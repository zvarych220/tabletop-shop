import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext.js'

export default function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth повинен використовуватися всередині AuthProvider')
  }
  return context
}
