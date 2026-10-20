import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router'
import PageHeading from '../components/ui/PageHeading.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import useCart from '../hooks/useCart.js'
import useOrders from '../hooks/useOrders.js'
import OrderPage from './OrderPage.jsx'

export default function OrderCreatePage() {
  const navigate = useNavigate()
  const { cartItems, clearCart } = useCart()
  const { createOrder } = useOrders()
  const pageAlive = useRef(false)

  useEffect(() => {
    pageAlive.current = true
    return () => {
      pageAlive.current = false
    }
  }, [])

  if (cartItems.length === 0) {
    return (
      <div className="order-create-empty">
        <PageHeading title="Оформлення замовлення" />
        <EmptyState title="Кошик порожній">
          <p>Додайте товари до кошика, щоб оформити замовлення:</p>
          <div className="action-links">
            <Link to="/games" className="app-button app-button-primary">
              <span>До каталогу ігор</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </EmptyState>
      </div>
    )
  }

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  async function handleSave(input) {
    const orderData = {
      ...input,
      orderedItems: cartItems.map(item => ({
        gameId: item.gameId,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
      })),
      totalPrice,
      gameId: cartItems[0].gameId,
    }

    const result = await createOrder(orderData)
    if (result.ok && pageAlive.current) {
      clearCart()
      const newOrderId = result.record?.id || result.record?.data?.id
      if (newOrderId) {
        navigate(`/orders/${encodeURIComponent(newOrderId)}`, { replace: true })
      } else {
        navigate('/orders', { replace: true })
      }
    }
    return result
  }

  function handleCancel() {
    navigate('/games', { replace: true })
  }

  return (
    <OrderPage
      key="new-from-cart"
      title="Оформлення замовлення"
      cartItems={cartItems}
      totalPrice={totalPrice}
      onSave={handleSave}
      onCancel={handleCancel}
      submitLabel="Оформити замовлення"
      cancelLabel="Скасувати"
    />
  )
}