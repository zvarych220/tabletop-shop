import { useState } from 'react'
import { Outlet, NavLink, Navigate, Link, useLocation } from 'react-router'
import useAdmin from '../../hooks/useAdmin.js'
import useAuth from '../../hooks/useAuth.js'
import {
  PackageIcon,
  ClipboardListIcon,
  UsersIcon,
  BarChartIcon,
  LogOutIcon,
  HomeIcon,
  MenuIcon,
  CloseIcon,
  DiceIcon,
  SparklesIcon,
} from '../ui/Icons.jsx'

const PAGE_BREADCRUMBS = {
  '/admin': 'Товари',
  '/admin/products': 'Товари',
  '/admin/orders': 'Замовлення',
  '/admin/users': 'Користувачі',
  '/admin/analytics': 'Аналітика',
}

export default function AdminLayout() {
  const { admin, logout } = useAdmin()
  const { isLoading: authLoading } = useAuth()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const location = useLocation()

  // Wait for auth to finish restoring from localStorage before redirecting
  if (authLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--admin-bg, #0f172a)' }}>
        <div style={{ color: '#94a3b8', fontSize: '1rem' }}>Завантаження...</div>
      </div>
    )
  }

  if (!admin) {
    return <Navigate to="/adminLogin" replace />
  }

  const currentPath = location.pathname
  const currentCrumb = PAGE_BREADCRUMBS[currentPath] || 'Огляд'

  const todayFormatted = new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  const closeMobileNav = () => setIsMobileNavOpen(false)

  return (
    <div className="admin-layout">
      {/* Mobile Backdrop */}
      {isMobileNavOpen && (
        <div
          className="admin-backdrop"
          onClick={closeMobileNav}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isMobileNavOpen ? 'mobile-open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-brand">
            <div className="admin-brand-logo">
              <DiceIcon size={24} />
            </div>
            <div className="admin-brand-info">
              <span className="admin-brand-title">Dice & Deck</span>
              <span className="admin-brand-badge">
                <SparklesIcon size={12} />
                Admin Suite
              </span>
            </div>
          </div>
          <button
            type="button"
            className="admin-sidebar-close"
            onClick={closeMobileNav}
            aria-label="Закрити меню"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        <div className="admin-sidebar-section-title">Головне меню</div>

        <nav className="admin-nav">
          <NavLink
            to="/admin/products"
            onClick={closeMobileNav}
            className={({ isActive }) =>
              isActive ? 'admin-nav-link active' : 'admin-nav-link'
            }
          >
            <span className="admin-nav-icon">
              <PackageIcon size={20} />
            </span>
            <span className="admin-nav-text">Товари</span>
          </NavLink>

          <NavLink
            to="/admin/orders"
            onClick={closeMobileNav}
            className={({ isActive }) =>
              isActive ? 'admin-nav-link active' : 'admin-nav-link'
            }
          >
            <span className="admin-nav-icon">
              <ClipboardListIcon size={20} />
            </span>
            <span className="admin-nav-text">Замовлення</span>
          </NavLink>

          <NavLink
            to="/admin/users"
            onClick={closeMobileNav}
            className={({ isActive }) =>
              isActive ? 'admin-nav-link active' : 'admin-nav-link'
            }
          >
            <span className="admin-nav-icon">
              <UsersIcon size={20} />
            </span>
            <span className="admin-nav-text">Користувачі</span>
          </NavLink>

          <NavLink
            to="/admin/analytics"
            onClick={closeMobileNav}
            className={({ isActive }) =>
              isActive ? 'admin-nav-link active' : 'admin-nav-link'
            }
          >
            <span className="admin-nav-icon">
              <BarChartIcon size={20} />
            </span>
            <span className="admin-nav-text">Аналітика</span>
          </NavLink>

          <div className="admin-sidebar-divider" />
          <div className="admin-sidebar-section-title">Магазин</div>

          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-nav-link admin-nav-link-store"
            onClick={closeMobileNav}
          >
            <span className="admin-nav-icon">
              <HomeIcon size={20} />
            </span>
            <span className="admin-nav-text">До магазину</span>
            <span className="admin-nav-external">↗</span>
          </Link>
        </nav>

        {/* User Card in Sidebar */}
        <div className="admin-sidebar-footer">
          <div className="admin-profile-card">
            <div className="admin-profile-avatar">
              {admin.name ? admin.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="admin-profile-meta">
              <span className="admin-profile-name">{admin.name}</span>
              <span className="admin-profile-role">
                <span className="admin-role-dot" />
                Адміністратор
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="admin-logout-btn"
            title="Вийти з системи"
          >
            <LogOutIcon size={18} />
            <span>Вийти</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main-wrapper">
        {/* TopBar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-menu-toggle"
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Відкрити меню"
            >
              <MenuIcon size={22} />
            </button>

            <div className="admin-breadcrumbs">
              <span className="admin-breadcrumb-root">Панель керування</span>
              <span className="admin-breadcrumb-sep">/</span>
              <span className="admin-breadcrumb-current">{currentCrumb}</span>
            </div>
          </div>

          <div className="admin-topbar-right">
            <div className="admin-status-pill">
              <span className="admin-status-ping" />
              <span className="admin-status-text">Система активна</span>
            </div>

            <div className="admin-date-badge">
              <span>{todayFormatted}</span>
            </div>

            <Link
              to="/"
              className="admin-topbar-store-btn"
              title="Перейти на вітрину магазину"
            >
              <HomeIcon size={16} />
              <span>Вітрина</span>
            </Link>

            <div className="admin-topbar-user">
              <div className="admin-topbar-avatar">
                {admin.name ? admin.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="admin-topbar-user-info">
                <span className="admin-topbar-user-name">{admin.name}</span>
                <span className="admin-topbar-user-email">{admin.email}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
