import { Outlet } from 'react-router'
import SiteHeader from './SiteHeader.jsx'
import BoardGameSelectionProvider from '../../providers/BoardGameSelectionProvider.jsx'
import OrdersProvider from '../../providers/OrdersProvider.jsx'
import { DiceIcon } from '../ui/Icons.jsx'

const navigationLinks = [
  { to: '/', label: 'Головна', end: true },
  { to: '/games', label: 'Каталог' },
  { to: '/orders', label: 'Замовлення' },
]

export default function AppLayout({ items }) {
  return (
    <div className="app-layout">
      <a className="skip-link" href="#main-content">Перейти до вмісту</a>
      <SiteHeader title="Dice & Deck" links={navigationLinks} />
      
      <main id="main-content" tabIndex={-1} className="main-container">
        <div className="main-container-inner">
          <BoardGameSelectionProvider items={items}>
            <OrdersProvider items={items}>
              <Outlet />
            </OrdersProvider>
          </BoardGameSelectionProvider>
        </div>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="footer-logo">
              <DiceIcon size={18} className="footer-logo-icon" />
              <span>Dice & Deck</span>
            </span>
            <p className="footer-tagline">Світ настільних стратегій, пригод та затишних вечорів з друзями.</p>
          </div>
          <div className="footer-meta">
            <p className="footer-note">© 2026 Dice & Deck. Навчальний проєкт (Лабораторна 3.1: CRUD та валідація).</p>
            <p className="footer-tech">Побудовано на React 19 + React Router v8</p>
          </div>
        </div>
      </footer>
    </div>
  )
}