import { useContext } from 'react'
import { OrdersContext } from '../context/OrdersContext.js'

export default function useOrders() {
  const context = useContext(OrdersContext)
  if (context === null) {
    throw new Error('useOrders must be used within OrdersProvider')
  }
  return context
}
