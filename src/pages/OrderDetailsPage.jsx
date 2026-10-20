import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import PageHeading from '../components/ui/PageHeading.jsx'
import AppButton from '../components/ui/AppButton.jsx'
import useOrders from '../hooks/useOrders.js'
import useDeleteOrder from '../hooks/useDeleteOrder.js'
import { useProducts } from '../hooks/useProducts.js'
import NotFoundPage from './NotFoundPage.jsx'
import { DiceIcon, ShieldCheckIcon } from '../components/ui/Icons.jsx'

export default function OrderDetailsPage() {
  const { orderId } = useParams()
  const { products } = useProducts()
  const navigate = useNavigate()
  const { orders, isMutating } = useOrders()
  const deleteWithConfirmation = useDeleteOrder(products)
  const [error, setError] = useState('')
  const pageAlive = useRef(false)

  useEffect(() => {
    pageAlive.current = true
    return () => {
      pageAlive.current = false
    }
  }, [])

  const order = orders.find((o) => String(o.id) === String(orderId))

  // Show loading state while orders are being fetched
  if (!order && isMutating) {
    return (
      <div className="order-details-container">
        <p>Завантаження замовлення...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <NotFoundPage
        title="Заявку не знайдено"
        message={`Заявку #${orderId} не знайдено в системі.`}
      />
    )
  }

  const primaryGame = products.find((g) => String(g.id) === String(order.gameId))
  const displayTitle = order.orderedItems?.length
    ? order.orderedItems.map((item) => item.title).join(', ')
    : (primaryGame?.title || order.gameId || 'Замовлення')

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
        <Link to="/orders" className="breadcrumb-link">Заявки</Link>
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
            <span className="order-details-sub">Клуб настільних ігор Dice & Deck</span>
            <h3 className="order-details-game-title">
              «{displayTitle}»
            </h3>
          </div>
        </div>

        <div className="order-details-body">
          <dl className="order-details-list">
            <dt>ID заявки:</dt>
            <dd><code>{order.id}</code></dd>

            <dt>{order.orderedItems?.length > 1 ? 'Ігри у замовленні:' : 'Настільна гра:'}</dt>
            <dd>
              {order.orderedItems?.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {order.orderedItems.map((item, idx) => {
                    const matchingProduct = products.find((p) => String(p.id) === String(item.gameId))
                    return (
                      <li key={idx} style={{ marginBottom: '0.25rem' }}>
                        {matchingProduct ? (
                          <Link to={`/games/${matchingProduct.id}`}>«{item.title}»</Link>
                        ) : (
                          <span>«{item.title}»</span>
                        )}
                        {item.quantity > 1 && <span> × {item.quantity} шт.</span>}
                        {item.price > 0 && <span> ({item.price} ₴)</span>}
                      </li>
                    )
                  })}
                </ul>
              ) : primaryGame ? (
                <Link to={`/games/${primaryGame.id}`}>«{primaryGame.title}»</Link>
              ) : (
                order.gameId || 'Не вказано'
              )}
            </dd>

            {order.totalPrice > 0 && (
              <>
                <dt>Сума до сплати:</dt>
                <dd><strong>{order.totalPrice} ₴</strong></dd>
              </>
            )}

            <dt>Тривалість гри:</dt>
            <dd>{order.durationHours} год.</dd>

            <dt>Консультація / майстер:</dt>
            <dd>{order.needsConsultation ? 'Так, потрібна' : 'Ні, не потрібна'}</dd>

            {order.comment && (
              <>
                <dt>Коментар:</dt>
                <dd className="order-details-comment">{order.comment}</dd>
              </>
            )}
          </dl>

          <p className="preview-notice">
            <ShieldCheckIcon size={16} />
            <span>Дані синхронізовано через асинхронний сервіс.</span>
          </p>

          <div className="details-actions">
            <Link to={`/orders/${encodeURIComponent(order.id)}/edit`} className="app-button app-button-primary">
              <span>Редагувати заявку</span>
              <span aria-hidden="true">→</span>
            </Link>
            <AppButton
              variant="secondary"
              onClick={handleDelete}
              disabled={isMutating}
              className="app-button-danger"
            >
              {isMutating ? 'Видалення…' : 'Видалити заявку'}
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
