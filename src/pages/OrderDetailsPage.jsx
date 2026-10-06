import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import PageHeading from '../components/ui/PageHeading.jsx'
import AppButton from '../components/ui/AppButton.jsx'
import useOrders from '../hooks/useOrders.js'
import useDeleteOrder from '../hooks/useDeleteOrder.js'
import NotFoundPage from './NotFoundPage.jsx'

export default function OrderDetailsPage({ items }) {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { orders, isMutating } = useOrders()
  const deleteWithConfirmation = useDeleteOrder(items)
  const [error, setError] = useState('')
  const pageAlive = useRef(false)

  useEffect(() => {
    pageAlive.current = true
    return () => {
      pageAlive.current = false
    }
  }, [])

  const order = orders.find((o) => o.id === orderId)
  if (!order) return <NotFoundPage title="Заявку не знайдено" message={`Заявку #${orderId} не знайдено в базі.`} />

  const game = items.find((g) => g.id === order.gameId)

  async function handleDelete() {
    if (isMutating) return
    setError('')
    const result = await deleteWithConfirmation(order)
    if (!pageAlive.current) return
    if (result.ok) {
      navigate('/orders', { replace: true })
    } else if (!result.cancelled) {
      setError(result.message)
    }
  }

  return (
    <div className="order-details-container">
      <PageHeading title={`Заявка #${order.id}`} />
      {error && <p className="field-error" role="alert">{error}</p>}

      <div className="details-card">
        <dl className="order-details-list">
          <dt>Настільна гра:</dt>
          <dd><strong>{game?.title ?? 'Товар відсутній у каталозі'}</strong></dd>

          <dt>Коментар покупця:</dt>
          <dd>{order.comment}</dd>

          <dt>Тривалість партії / броні:</dt>
          <dd>{order.durationHours} год.</dd>

          <dt>Консультація гейм-майстра:</dt>
          <dd>{order.needsConsultation ? 'Потрібна' : 'Не потрібна'}</dd>
        </dl>

        <p className="preview-notice">ℹ️ Дані підтверджено сервісом.</p>

        <div className="details-actions">
          <Link to={`/orders/${order.id}/edit`} className="app-button app-button-primary">
            Редагувати заявку
          </Link>
          <AppButton variant="secondary" onClick={handleDelete} disabled={isMutating}>
            {isMutating ? 'Видалення…' : 'Видалити заявку'}
          </AppButton>
          <Link to="/orders" className="app-button app-button-secondary">
            До всіх заявок
          </Link>
        </div>
      </div>
    </div>
  )
}
