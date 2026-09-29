import { useState } from 'react'
import { Link } from 'react-router'
import PageHeading from '../components/ui/PageHeading.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import AppButton from '../components/ui/AppButton.jsx'
import OrderFilters from '../components/orders/OrderFilters.jsx'
import OrderTable from '../components/orders/OrderTable.jsx'
import useOrders from '../hooks/useOrders.js'
import useOrderFilters from '../hooks/useOrderFilters.js'
import useDeleteOrder from '../hooks/useDeleteOrder.js'
import { PackageIcon, MessageSquareIcon } from '../components/ui/Icons.jsx'

export default function OrdersPage({ items }) {
  const { orders } = useOrders()
  const filters = useOrderFilters(orders, items)
  const deleteWithConfirmation = useDeleteOrder(items)
  const [error, setError] = useState('')

  const needsConsultCount = orders.filter((o) => o.needsConsultation).length

  function handleDelete(order) {
    setError('')
    const result = deleteWithConfirmation(order)
    if (!result.ok && !result.cancelled) {
      setError(result.message)
    }
  }

  return (
    <div className="orders-page-container">
      <div className="orders-header-row">
        <div>
          <PageHeading title="Замовлення та броні" />
          <p className="field-hint">Нижче наведено перелік актуальних заявок клієнтів магазину.</p>
        </div>
        <Link to="/orders/new" className="app-button app-button-primary">
          <span>+ Створити нове замовлення</span>
        </Link>
      </div>

      <div className="orders-stats-row">
        <div className="orders-stat-card">
          <span className="orders-stat-icon-wrap">
            <PackageIcon size={22} className="orders-stat-svg" />
          </span>
          <div>
            <span className="orders-stat-label">Усього замовлень</span>
            <strong className="orders-stat-value">{orders.length}</strong>
          </div>
        </div>
        <div className="orders-stat-card">
          <span className="orders-stat-icon-wrap">
            <MessageSquareIcon size={22} className="orders-stat-svg" />
          </span>
          <div>
            <span className="orders-stat-label">Потребують консультації</span>
            <strong className="orders-stat-value">{needsConsultCount}</strong>
          </div>
        </div>
      </div>

      <OrderFilters
        query={filters.query}
        consultation={filters.consultation}
        sort={filters.sort}
        onQueryChange={filters.setQuery}
        onConsultationChange={filters.setConsultation}
        onSortChange={filters.setSort}
        onReset={filters.resetFilters}
      />

      <div className="orders-count-row">
        <p className="items-count-badge">
          Показано: <strong>{filters.visibleOrders.length}</strong> із {orders.length}
        </p>
      </div>

      {error && <p className="field-error form-top-error" role="alert">{error}</p>}

      {orders.length === 0 ? (
        <EmptyState title="Заявок ще немає">
          <p>
            <Link to="/games" className="app-button app-button-primary">
              <span>Оберіть настільну гру в каталозі для першої заявки</span>
              <span aria-hidden="true">→</span>
            </Link>
          </p>
        </EmptyState>
      ) : filters.visibleOrders.length === 0 ? (
        <EmptyState title="За цими умовами нічого не знайдено">
          <p>Спробуйте змінити пошуковий запит або скинути встановлені фільтри.</p>
          <AppButton variant="secondary" onClick={filters.resetFilters}>
            Показати всі замовлення
          </AppButton>
        </EmptyState>
      ) : (
        <OrderTable
          orders={filters.visibleOrders}
          items={items}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}