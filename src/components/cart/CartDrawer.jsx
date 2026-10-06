import { Link, useNavigate } from 'react-router'
import useCart from '../../hooks/useCart.js'
import { CartIcon, TrashIcon, DiceIcon, CheckCircleIcon, TruckIcon } from '../ui/Icons.jsx'

export default function CartDrawer() {
  const {
    cartItems,
    cartCount,
    cartTotal,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
  } = useCart()

  const navigate = useNavigate()

  if (!isCartOpen) return null

  const freeShippingThreshold = 1500
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - cartTotal)
  const freeShippingProgress = Math.min(100, Math.round((cartTotal / freeShippingThreshold) * 100))

  function handleCheckout() {
    closeCart()
    navigate('/orders/new')
  }

  return (
    <div className="cart-drawer-overlay" onClick={closeCart}>
      <aside
        className="cart-drawer"
        role="dialog"
        aria-label="Кошик покупок"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cart-drawer-header">
          <div className="cart-header-title-row">
            <CartIcon size={20} className="cart-title-icon" />
            <h2 className="cart-drawer-title">
              КОШИК <span className="cart-count-badge">({cartCount})</span>
            </h2>
          </div>
          <button
            type="button"
            className="cart-close-btn"
            onClick={closeCart}
            aria-label="Закрити кошик"
          >
            ✕
          </button>
        </div>

        {/* Free shipping bar */}
        <div className="cart-shipping-bar">
          <div className="shipping-text">
            {freeShippingRemaining === 0 ? (
              <span className="shipping-unlocked">
                <CheckCircleIcon size={14} className="shipping-check-svg" /> Вітаємо! У вас <strong>безкоштовна доставка</strong>!
              </span>
            ) : (
              <span>
                <TruckIcon size={14} className="shipping-truck-svg" /> До безкоштовної доставки залишилося <strong>{freeShippingRemaining} ₴</strong>
              </span>
            )}
          </div>

          <div className="shipping-progress-track">
            <div
              className="shipping-progress-fill"
              style={{ width: `${freeShippingProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Cart items list or empty */}
        <div className="cart-drawer-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty-state">
              <DiceIcon size={48} className="empty-cart-icon" />
              <h3>Ваш кошик порожній</h3>
              <p>Оберіть цікаві настільні ігри в каталозі для незабутніх вечорів!</p>
              <button
                type="button"
                className="app-button app-button-primary"
                onClick={() => {
                  closeCart()
                  navigate('/games')
                }}
              >
                Перейти до каталогу
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div key={item.gameId} className="cart-item-card">
                  <div className="cart-item-img-wrap">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="cart-item-img"
                    />
                  </div>

                  <div className="cart-item-details">
                    <div className="cart-item-top">
                      <span className="cart-item-category">{item.category}</span>
                      <button
                        type="button"
                        className="cart-remove-btn"
                        onClick={() => removeFromCart(item.gameId)}
                        title="Видалити з кошика"
                        aria-label={`Видалити ${item.title}`}
                      >
                        <TrashIcon size={15} />
                      </button>
                    </div>

                    <Link
                      to={`/games/${item.gameId}`}
                      className="cart-item-title"
                      onClick={closeCart}
                    >
                      {item.title}
                    </Link>

                    <div className="cart-item-price-row">
                      <span className="cart-item-price">{item.price} ₴</span>
                    </div>

                    <div className="cart-item-actions">
                      <div className="cart-qty-counter">
                        <button
                          type="button"
                          className="cart-qty-btn"
                          onClick={() => updateQuantity(item.gameId, item.quantity - 1)}
                          aria-label="Зменшити кількість"
                        >
                          −
                        </button>
                        <span className="cart-qty-num">{item.quantity}</span>
                        <button
                          type="button"
                          className="cart-qty-btn"
                          onClick={() => updateQuantity(item.gameId, item.quantity + 1)}
                          aria-label="Збільшити кількість"
                        >
                          +
                        </button>
                      </div>

                      <span className="cart-item-subtotal">
                        Разом: <strong>{item.price * item.quantity} ₴</strong>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with subtotal & checkout */}
        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-summary-line">
              <span className="summary-label">Загальна сума:</span>
              <strong className="summary-total">{cartTotal} ₴</strong>
            </div>
            <p className="cart-checkout-hint">
              Всі товари перевірені та готові до відправлення Новою Поштою або Укрпоштою.
            </p>

            <button
              type="button"
              className="cart-checkout-btn"
              onClick={handleCheckout}
            >
              Оформити замовлення • {cartTotal} ₴
            </button>

            <button
              type="button"
              className="cart-continue-btn"
              onClick={closeCart}
            >
              Продовжити покупки
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}
