import { useNavigate, useParams } from 'react-router'
import OrderPage from './OrderPage.jsx'
import NotFoundPage from './NotFoundPage.jsx'

export default function OrderEditPage({ orders, items }) {
  const { orderId } = useParams()
  const navigate = useNavigate()

  const order = orders.find((entry) => entry.id === orderId)

  if (!order) {
    return (
      <NotFoundPage
        title="Заявку не знайдено"
        message={`Замовлення з номером «${orderId}» не існує в базі даних.`}
      />
    )
  }

  const game = items.find((entry) => entry.id === order.gameId)

  if (!game) {
    return (
      <NotFoundPage
        title="Товар замовлення відсутній"
        message="Настільну гру для цієї заявки було видалено з каталогу."
      />
    )
  }

  return (
    <OrderPage
      key={`edit-${order.id}`}
      title={`Редагування заявки #${order.id}`}
      game={game}
      initialDraft={{ comment: order.comment, needsConsultation: order.needsConsultation }}
      onCancel={() => navigate('/orders')}
      cancelLabel="← Назад до списку заявок"
    />
  )
}