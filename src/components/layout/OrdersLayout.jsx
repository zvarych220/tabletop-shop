import { NavLink, Outlet } from 'react-router'
import { ClipboardListIcon, FilePlusIcon } from '../ui/Icons.jsx'
import OrderNotice from '../orders/OrderNotice.jsx'

export default function OrdersLayout() {
  return (
    <div className="orders-section-layout">
      <div className="orders-header-bar">
        <nav aria-label="Навігація замовлень" className="orders-subnav">
          <NavLink
            to="."
            end
            className={({ isActive }) => (isActive ? 'subnav-link active' : 'subnav-link')}
          >
            <ClipboardListIcon size={16} className="subnav-icon-svg" />
            <span>Список замовлень</span>
          </NavLink>
          <NavLink
            to="new"
            className={({ isActive }) => (isActive ? 'subnav-link active' : 'subnav-link')}
          >
            <FilePlusIcon size={16} className="subnav-icon-svg" />
            <span>Нова заявка</span>
          </NavLink>
        </nav>
      </div>

      <OrderNotice />
      <p className="field-hint memory-hint">
        <em>Дані зберігаються в пам'яті до перезавантаження вкладки.</em>
      </p>

      <div className="orders-content">
        <Outlet />
      </div>
    </div>
  )
}