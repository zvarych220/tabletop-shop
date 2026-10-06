import { Link } from 'react-router'
import MainNav from '../navigation/MainNav.jsx'
import { DiceIcon, CartIcon } from '../ui/Icons.jsx'
import useCart from '../../hooks/useCart.js'

export default function SiteHeader({ title, links }) {
  const { cartCount, openCart } = useCart()

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="site-title logo-box" to="/">
          <span className="logo-icon-wrapper">
            <DiceIcon size={22} className="logo-icon-svg" />
          </span>
          <div className="logo-text-group">
            <span className="logo-text">{title}</span>
            <span className="logo-subtext">Tabletop Shop</span>
          </div>
        </Link>

        <div className="header-nav-actions">
          <MainNav links={links} />

          <button
            type="button"
            className="header-cart-btn"
            onClick={openCart}
            aria-label={`Кошик з ${cartCount} товарами`}
          >
            <CartIcon size={18} className="cart-btn-icon" />
            <span className="cart-btn-label">Кошик</span>
            {cartCount > 0 && (
              <span className="cart-badge-count">{cartCount}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}