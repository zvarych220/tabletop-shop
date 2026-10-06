import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, useLocation } from 'react-router'
import MainNav from '../navigation/MainNav.jsx'
import {
  DiceIcon,
  CartIcon,
  MenuIcon,
  CloseIcon,
  HomeIcon,
  PackageIcon,
  TruckIcon,
} from '../ui/Icons.jsx'
import useCart from '../../hooks/useCart.js'

export default function SiteHeader({ title, links }) {
  const { cartCount, openCart } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  // Auto-close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

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

        {/* Desktop Navigation */}
        <div className="header-desktop-nav">
          <MainNav links={links} />
        </div>

        {/* Header Right Actions */}
        <div className="header-actions">
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

          {/* Mobile Burger Toggle Button */}
          <button
            type="button"
            className="mobile-burger-btn"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Закрити меню' : 'Відкрити меню'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <CloseIcon size={22} className="burger-icon" />
            ) : (
              <MenuIcon size={22} className="burger-icon" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer rendered into body via Portal */}
      {mobileMenuOpen &&
        createPortal(
          <div
            className="mobile-menu-overlay"
            onClick={() => setMobileMenuOpen(false)}
          >
            <aside
              className="mobile-menu-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Мобільне меню навігації"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mobile-menu-drawer-header">
                <div className="mobile-menu-drawer-brand">
                  <span className="mobile-drawer-logo-icon">
                    <DiceIcon size={20} />
                  </span>
                  <div className="mobile-drawer-brand-text">
                    <span className="mobile-drawer-logo-text">Dice & Deck</span>
                    <span className="mobile-drawer-logo-sub">Tabletop Shop</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="mobile-menu-close-btn"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Закрити меню"
                >
                  <CloseIcon size={20} />
                </button>
              </div>

              <div className="mobile-menu-nav-wrap">
                <span className="mobile-menu-section-label">Навігація</span>
                <ul className="mobile-menu-list">
                  {links.map((link) => {
                    let IconComponent = DiceIcon
                    let subtitle = 'Усі настільні ігри'
                    if (link.to === '/') {
                      IconComponent = HomeIcon
                      subtitle = 'Головна та новинки'
                    } else if (link.to === '/orders') {
                      IconComponent = PackageIcon
                      subtitle = 'Історія замовлень'
                    }

                    return (
                      <li key={link.to}>
                        <NavLink
                          to={link.to}
                          end={link.end}
                          className={({ isActive }) =>
                            isActive ? 'mobile-menu-link active' : 'mobile-menu-link'
                          }
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <span className="mobile-link-icon-box">
                            <IconComponent size={20} />
                          </span>
                          <div className="mobile-link-text-group">
                            <span className="mobile-link-title">{link.label}</span>
                            <span className="mobile-link-subtitle">{subtitle}</span>
                          </div>
                          <span className="mobile-menu-link-arrow">›</span>
                        </NavLink>
                      </li>
                    )
                  })}
                </ul>
              </div>

              <div className="mobile-menu-drawer-footer">
                <button
                  type="button"
                  className="mobile-menu-cart-action"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    openCart()
                  }}
                >
                  <CartIcon size={18} />
                  <span>Переглянути кошик ({cartCount})</span>
                </button>

                <div className="mobile-menu-perk">
                  <TruckIcon size={16} />
                  <span>Доставка: Нова Пошта & Укрпошта</span>
                </div>
              </div>
            </aside>
          </div>,
          document.body
        )}
    </header>
  )
}