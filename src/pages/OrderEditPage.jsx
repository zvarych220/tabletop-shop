import { useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router'
import useOrders from '../hooks/useOrders.js'
import OrderPage from './OrderPage.jsx'
import NotFoundPage from './NotFoundPage.jsx'

export default function OrderEditPage({ items }) {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { orders, updateOrder } = useOrders()
  const pageAlive = useRef(false)
  const activeId = useRef(orderId)

  useEffect(() => {
    pageAlive.current = true
    activeId.current = orderId
    return () => {
      pageAlive.current = false
      activeId.current = null
    }
  }, [orderId])

  const order = orders.find((o) => o.id === orderId)
  if (!order) return <NotFoundPage title="Заявку не знайдено" message={`Заявку #${orderId} не знайдено.`} />

  const game = items.find((g) => g.id === order.gameId)
  if (!game) return <NotFoundPage title="Товар відсутній" message="Гру для цієї заявки було видалено." />

  async function handleSave(input) {
    const result = await updateOrder(order.id, input)
    if (result.ok && pageAlive.current && activeId.current === order.id) {
      navigate(`/orders/${encodeURIComponent(result.record.id)}`, { replace: true })
    }
    return result
  }

  return (
    <OrderPage
      key={`edit-${order.id}`}
      title={`Редагування заявки #${order.id}`}
      game={game}
      initialDraft={{
        comment: order.comment,
        durationHours: order.durationHours,
        needsConsultation: order.needsConsultation,
      }}
      onSave={handleSave}
      onCancel={() => navigate(`/orders/${encodeURIComponent(order.id)}`)}
      submitLabel="Зберегти зміни"
      cancelLabel="Скасувати редагування"
    />
  )
}