import { useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import PageHeading from '../components/ui/PageHeading.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import useBoardGameSelection from '../hooks/useBoardGameSelection.js'
import useOrders from '../hooks/useOrders.js'
import useCart from '../hooks/useCart.js'
import OrderPage from './OrderPage.jsx'
import NotFoundPage from './NotFoundPage.jsx'

export default function OrderCreatePage({ items }) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { selectedId, clearSelection } = useBoardGameSelection()
  const { createOrder } = useOrders()
  const { cartItems, clearCart } = useCart()
  const pageAlive = useRef(false)

  useEffect(() => {
    pageAlive.current = true
    return () => {
      pageAlive.current = false
    }
  }, [])

  const gameId = searchParams.get('gameId')

  // Якщо немає gameId і кошик порожній
  if (!gameId && cartItems.length === 0) {
    return (
      <div className="order-create-empty">
        <PageHeading title="Оформлення замовлення" />
        <EmptyState title="Товари для покупки не обрані">
          <p>Щоб оформити замовлення, оберіть настільну гру в каталозі або додайте товари до кошика:</p>
          <div className="action-links">
            <Link to="/games" className="app-button app-button-primary">
              <span>До каталогу ігор</span>
              <span aria-hidden="true">→</span>
            </Link>
            {selectedId && (
              <Link to={`/orders/new?gameId=${selectedId}`} className="app-button app-button-secondary">
                Використати останній вибір ({selectedId})
              </Link>
            )}
          </div>
        </EmptyState>
      </div>
    )
  }

  // Якщо вказано конкретний gameId
  const singleGame = gameId ? items.find((entry) => entry.id === gameId) : null
  if (gameId && !singleGame) {
    return (
      <NotFoundPage
        title="Гру не знайдено"
        message={`Гру з ID «${gameId}» не знайдено в каталозі для оформлення покупки.`}
      />
    )
  }

  // Ефективний список товарів для чеку
  const effectiveOrderedItems = singleGame
    ? [{ gameId: singleGame.id, title: singleGame.title, price: singleGame.price, quantity: 1 }]
    : cartItems.map((c) => ({
        gameId: c.gameId,
        title: c.title,
        price: c.price,
        quantity: c.quantity,
      }))

  const primaryGame = singleGame || items.find((g) => g.id === effectiveOrderedItems[0]?.gameId)

  async function handleSave(input) {
    const result = await createOrder(input)
    if (result.ok && pageAlive.current) {
      if (!gameId && cartItems.length > 0) {
        clearCart()
      }
      navigate(`/orders/${encodeURIComponent(result.record.id)}`, { replace: true })
    }
    return result
  }

  function handleCancel() {
    clearSelection()
    navigate('/games', { replace: true })
  }

  return (
    <OrderPage
      key={gameId ? `new-${gameId}` : 'cart-order'}
      title="Оформлення замовлення та доставки"
      game={primaryGame}
      orderedItems={effectiveOrderedItems}
      onSave={handleSave}
      onCancel={handleCancel}
      submitLabel="Підтвердити замовлення"
      cancelLabel="Скасувати"
    />
  )
}