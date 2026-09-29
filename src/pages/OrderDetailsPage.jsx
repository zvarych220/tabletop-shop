import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import PageHeading from '../components/ui/PageHeading.jsx'
import AppButton from '../components/ui/AppButton.jsx'
import useOrders from '../hooks/useOrders.js'
import useDeleteOrder from '../hooks/useDeleteOrder.js'
import NotFoundPage from './NotFoundPage.jsx'
import { ClockIcon, MessageSquareIcon, DiceIcon } from '../components/ui/Icons.jsx'

export default function OrderDetailsPage({ items }) {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { orders } = useOrders()
  const deleteWithConfirmation = useDeleteOrder(items)
  const [error, setError] = useState('')

  const order = orders.find((o) => o.id === orderId)
  if (!order) {
    return (
      <NotFoundPage
        title="Заявку не знайдено"
        message={`Заявку #${orderId} не знайдено в базі даних.`}
      />
    )
  }

  const game = items.find((g) => g.id === order.gameId)

  function handleDelete() {
    setError('')
    const result = deleteWithConfirmation(order)
    if (result.ok) {
      navigate('/orders', { replace: true })
    } else if (!result.cancelled) {
      setError(result.message)
    }
  }

  return (
    <div className="order-details-container">
      <nav aria-label="Хлібні крихти" className="breadcrumbs-nav">
        <Link to="/" className="breadcrumb-link">Головна</Link>
        <span className="breadcrumb-separator">/</span>
        <Link to="/orders" className="breadcrumb-link">Замовлення</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current" aria-current="page">Заявка #{order.id}</span>
      </nav>

      <PageHeading title={`Заявка #${order.id}`} />
      {error && <p className="field-error form-top-error" role="alert">{error}</p>}

      <div className="details-card order-details-card">
        <div className="order-details-hero">
          <div className="order-details-hero-badge">
            <DiceIcon size={24} className="order-details-dice" />
          </div>
          <div className="order-details-hero-text">
            <span className="order-details-sub">Детальна інформація про бронь</span>
            <h3 className="order-details-game-title">{game?.title ?? 'Товар відсутній у каталозі'}</h3>
          </div>
        </div>

        <div className="order-details-body">
          <dl className="order-details-list">
            <dt>Настільна гра:</dt>
            <dd>
              <strong>{game?.title ?? 'Товар відсутній у каталозі'}</strong>
              {game && (
                <span className="order-details-game-sub"> ({game.category} • {game.price} ₴)</span>
              )}
            </dd>

            <dt>Коментар покупця:</dt>
            <dd className="order-details-comment">{order.comment}</dd>

            <dt>Тривалість партії / броні:</dt>
            <dd className="order-details-duration">
              <ClockIcon size={16} className="spec-icon-svg" />
              <span>{order.durationHours} год.</span>
            </dd>

            <dt>Консультація гейм-майстра:</dt>
            <dd>
              <span className={`consult-badge ${order.needsConsultation ? 'consult-needed' : 'consult-none'}`}>
                {order.needsConsultation ? (
                  <>
                    <MessageSquareIcon size={13} className="consult-badge-svg" />
                    <span>Потрібна</span>
                  </>
                ) : (
                  <span>Не потрібна</span>
                )}
              </span>
            </dd>
          </dl>

          <p className="preview-notice">
            Запис збережено в локальній пам’яті застосунку.
          </p>

          <div className="details-actions">
            <Link to={`/orders/${encodeURIComponent(order.id)}/edit`} className="app-button app-button-primary">
              <span>Редагувати заявку</span>
              <span aria-hidden="true">→</span>
            </Link>
            <AppButton variant="secondary" onClick={handleDelete} className="app-button-danger">
              Видалити заявку
            </AppButton>
            <Link to="/orders" className="app-button app-button-secondary">
              ← До всіх заявок
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
