import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import PageHeading from '../components/ui/PageHeading.jsx'
import AppButton from '../components/ui/AppButton.jsx'
import useOrders from '../hooks/useOrders.js'
import useDeleteOrder from '../hooks/useDeleteOrder.js'
import NotFoundPage from './NotFoundPage.jsx'
import { DiceIcon, TruckIcon, ShieldCheckIcon, CreditCardIcon, CashIcon } from '../components/ui/Icons.jsx'

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
  if (!order) {
    return (
      <NotFoundPage
        title="Замовлення не знайдено"
        message={`Замовлення #${orderId} не знайдено в базі даних.`}
      />
    )
  }

  const effectiveItems = order.orderedItems?.length > 0
    ? order.orderedItems
    : items.filter((g) => g.id === order.gameId).map((g) => ({
        gameId: g.id,
        title: g.title,
        price: g.price,
        quantity: 1,
      }))

  const totalSum = order.totalPrice || effectiveItems.reduce((acc, it) => acc + (it.price || 0) * (it.quantity || 1), 0)

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
      <nav aria-label="Хлібні крихти" className="breadcrumbs-nav">
        <Link to="/" className="breadcrumb-link">Головна</Link>
        <span className="breadcrumb-separator">/</span>
        <Link to="/orders" className="breadcrumb-link">Замовлення</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current" aria-current="page">Замовлення #{order.id}</span>
      </nav>

      <PageHeading title={`Замовлення #${order.id}`} />
      {error && <p className="field-error form-top-error" role="alert">{error}</p>}

      <div className="details-card order-details-card">
        <div className="order-details-hero">
          <div className="order-details-hero-badge">
            <DiceIcon size={24} className="order-details-dice" />
          </div>
          <div className="order-details-hero-text">
            <span className="order-details-sub">Покупка в магазині Dice & Deck</span>
            <h3 className="order-details-game-title">
              {order.fullName || 'Покупець магазину'} • {totalSum} ₴
            </h3>
          </div>
        </div>

        <div className="order-details-body">
          {/* Items in order */}
          <div className="details-ordered-products-box">
            <h4 className="ordered-products-heading">Замовлені настільні ігри:</h4>
            <div className="ordered-products-list">
              {effectiveItems.map((it, idx) => (
                <div key={idx} className="ordered-product-row">
                  <span className="ordered-product-title">
                    <Link to={`/games/${it.gameId}`}>«{it.title}»</Link> × {it.quantity || 1} шт.
                  </span>
                  <strong className="ordered-product-price">
                    {(it.price || 0) * (it.quantity || 1)} ₴
                  </strong>
                </div>
              ))}
            </div>
            <div className="ordered-products-total-line">
              <span>Загальна сума покупки:</span>
              <strong className="ordered-total-number">{totalSum} ₴</strong>
            </div>
          </div>

          <dl className="order-details-list">
            <dt>Одержувач:</dt>
            <dd><strong>{order.fullName || 'Не вказано'}</strong></dd>

            <dt>Номер телефону:</dt>
            <dd>{order.phone || 'Не вказано'}</dd>

            <dt>Служба доставки:</dt>
            <dd>
              <span className="delivery-method-tag">
                <TruckIcon size={14} />
                <span>{order.deliveryService === 'ukr_poshta' ? 'Укрпошта' : 'Нова Пошта'}</span>
              </span>
            </dd>

            <dt>Адреса доставки:</dt>
            <dd>{order.city ? `${order.city}, ${order.branch}` : 'Не вказано'}</dd>

            <dt>Спосіб оплати:</dt>
            <dd>
              {order.paymentMethod === 'online'
                ? <><CreditCardIcon size={14} className="detail-icon-svg" /> Онлайн-оплата картою</>
                : <><CashIcon size={14} className="detail-icon-svg" /> Оплата при отриманні</>}
            </dd>

            {order.comment && (
              <>
                <dt>Коментар покупця:</dt>
                <dd className="order-details-comment">{order.comment}</dd>
              </>
            )}
          </dl>

          <p className="preview-notice">
            <ShieldCheckIcon size={16} />
            <span>Дані синхронізовано через асинхронний сервіс. Замовлення готується до відправки.</span>
          </p>

          <div className="details-actions">
            <Link to={`/orders/${encodeURIComponent(order.id)}/edit`} className="app-button app-button-primary">
              <span>Редагувати дані</span>
              <span aria-hidden="true">→</span>
            </Link>
            <AppButton
              variant="secondary"
              onClick={handleDelete}
              disabled={isMutating}
              className="app-button-danger"
            >
              {isMutating ? 'Скасування…' : 'Скасувати замовлення'}
            </AppButton>
            <Link to="/orders" className="app-button app-button-secondary">
              ← До всіх замовлень
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
