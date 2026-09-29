import { useState } from 'react'
import { OrdersContext } from '../context/OrdersContext.js'
import { orders as initialOrders } from '../data/orders.js'
import { validateOrder } from '../domain/orderValidation.js'

export default function OrdersProvider({ items, children }) {
  const [orders, setOrders] = useState(() => initialOrders.map((o) => ({ ...o })))
  const [notice, setNotice] = useState('')

  function createOrder(input) {
    const validation = validateOrder(input, items)
    if (!validation.ok) return validation

    const record = {
      id: `ord-${crypto.randomUUID().slice(0, 8)}`,
      ...validation.value,
    }

    setOrders((prev) => [...prev, record])
    setNotice('Заявку успішно створено в локальній колекції.')
    return { ok: true, record }
  }

  function updateOrder(id, input) {
    const current = orders.find((o) => o.id === id)
    if (!current) return { ok: false, message: 'Заявку для оновлення не знайдено.' }

    const validation = validateOrder(input, items)
    if (!validation.ok) return validation

    const record = { ...validation.value, id: current.id }
    setOrders((prev) => prev.map((o) => (o.id === id ? record : o)))
    setNotice('Зміни заявки успішно збережено.')
    return { ok: true, record }
  }

  function deleteOrder(id) {
    if (!orders.some((o) => o.id === id)) {
      return { ok: false, message: 'Заявку для видалення не знайдено.' }
    }
    setOrders((prev) => prev.filter((o) => o.id !== id))
    setNotice('Заявку видалено з локальної колекції.')
    return { ok: true }
  }

  function dismissNotice() {
    setNotice('')
  }

  return (
    <OrdersContext.Provider
      value={{ orders, notice, createOrder, updateOrder, deleteOrder, dismissNotice }}
    >
      {children}
    </OrdersContext.Provider>
  )
}
