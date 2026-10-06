import { NavLink, Outlet } from 'react-router'
import OrderNotice from '../orders/OrderNotice.jsx'
import OrdersGate from '../orders/OrdersGate.jsx'

export default function OrdersLayout() {
  return (
    <div className="orders-section-layout">
      <nav aria-label="Навігація замовлень" className="orders-subnav">
        <NavLink to="." end className={({ isActive }) => (isActive ? 'subnav-link active' : 'subnav-link')}>
          Список замовлень
        </NavLink>
        <NavLink to="new" className={({ isActive }) => (isActive ? 'subnav-link active' : 'subnav-link')}>
          Нова заявка
        </NavLink>
      </nav>

      <OrderNotice />
      <p className="field-hint"><em>Дані синхронізуються через асинхронний сервіс.</em></p>

      <div className="orders-content">
        <OrdersGate>
          <Outlet />
        </OrdersGate>
      </div>
    </div>
  )
}