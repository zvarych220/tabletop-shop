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
  HeartIcon,
  UserIcon,
  LogOutIcon,
  ChevronDownIcon,
} from '../ui/Icons.jsx'
import useCart from '../../hooks/useCart.js'
import useAuth from '../../hooks/useAuth.js'
import useFavorites from '../../hooks/useFavorites.js'

export default function SiteHeader({ title, links }) {
  const { cartCount, openCart } = useCart()
  const { user, isAuthenticated, logout } = useAuth()
  const { favoritesCount } = useFavorites()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()

  // Auto-close mobile drawer and user menu on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileMenuOpen(false)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUserMenuOpen(false)
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
          <div className="header-auth-section">
            <Link
              to="/favorites"
              className="header-favorites-btn"
              aria-label={`Обране (${favoritesCount})`}
            >
              <HeartIcon size={18} className="header-favorites-icon" />
              <span>Обране</span>
              {favoritesCount > 0 && (
                <span className="favorites-badge-count">{favoritesCount}</span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="header-user-menu">
                <button
                  type="button"
                  className="header-user-trigger"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  aria-label="Меню користувача"
                  aria-expanded={userMenuOpen}
                >
                  <UserIcon size={18} />
                  <span className="user-name-text">{user?.name}</span>
                  <ChevronDownIcon size={14} />
                </button>

                {userMenuOpen && (
                  <div className="user-dropdown-menu">
                    <Link to="/profile" className="user-dropdown-item">
                      <UserIcon size={16} />
                      Мій профіль
                    </Link>
                    <div className="user-dropdown-divider" />
                    <button
                      type="button"
                      className="user-dropdown-item"
                      onClick={async () => {
                        await logout()
                        setUserMenuOpen(false)
                      }}
                    >
                      <LogOutIcon size={16} />
                      Вийти
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="header-login-btn">
                <UserIcon size={16} />
                Увійти
              </Link>
            )}
          </div>

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

              <div className="mobile-menu-nav-wrap">
                <span className="mobile-menu-section-label">Акаунт</span>
                <ul className="mobile-menu-list">
                  <li>
                    <NavLink
                      to="/favorites"
                      className={({ isActive }) =>
                        isActive ? 'mobile-menu-link active' : 'mobile-menu-link'
                      }
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="mobile-link-icon-box">
                        <HeartIcon size={20} />
                      </span>
                      <div className="mobile-link-text-group">
                        <span className="mobile-link-title">Обране</span>
                        <span className="mobile-link-subtitle">Список бажань ({favoritesCount})</span>
                      </div>
                      <span className="mobile-menu-link-arrow">›</span>
                    </NavLink>
                  </li>
                  {isAuthenticated ? (
                    <>
                      <li>
                        <NavLink
                          to="/profile"
                          className={({ isActive }) =>
                            isActive ? 'mobile-menu-link active' : 'mobile-menu-link'
                          }
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <span className="mobile-link-icon-box">
                            <UserIcon size={20} />
                          </span>
                          <div className="mobile-link-text-group">
                            <span className="mobile-link-title">Мій профіль</span>
                            <span className="mobile-link-subtitle">{user?.name}</span>
                          </div>
                          <span className="mobile-menu-link-arrow">›</span>
                        </NavLink>
                      </li>
                      <li>
                        <button
                          type="button"
                          className="mobile-menu-link"
                          onClick={async () => {
                            await logout()
                            setMobileMenuOpen(false)
                          }}
                          style={{ width: '100%', textAlign: 'left' }}
                        >
                          <span className="mobile-link-icon-box">
                            <LogOutIcon size={20} />
                          </span>
                          <div className="mobile-link-text-group">
                            <span className="mobile-link-title">Вийти</span>
                            <span className="mobile-link-subtitle">Завершити сесію</span>
                          </div>
                          <span className="mobile-menu-link-arrow">›</span>
                        </button>
                      </li>
                    </>
                  ) : (
                    <li>
                      <NavLink
                        to="/login"
                        className={({ isActive }) =>
                          isActive ? 'mobile-menu-link active' : 'mobile-menu-link'
                        }
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="mobile-link-icon-box">
                          <UserIcon size={20} />
                        </span>
                        <div className="mobile-link-text-group">
                          <span className="mobile-link-title">Увійти</span>
                          <span className="mobile-link-subtitle">Вхід до акаунту</span>
                        </div>
                        <span className="mobile-menu-link-arrow">›</span>
                      </NavLink>
                    </li>
                  )}
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