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
import useAuth from '../hooks/useAuth.js'
import { useProducts } from '../hooks/useProducts.js'
import { PackageIcon } from '../components/ui/Icons.jsx'

export default function OrdersPage() {
  const { products } = useProducts()
  const { user } = useAuth()
  const { orders, reload, isMutating } = useOrders()
  const userOrders = user ? orders.filter(o => !o.userId || String(o.userId) === String(user.id)) : []
  const filters = useOrderFilters(userOrders, products)
  const deleteWithConfirmation = useDeleteOrder(products)
  const [error, setError] = useState('')

  const pendingCount = userOrders.filter((o) => o.status === 'pending').length
  const consultationCount = userOrders.filter((o) => o.needsConsultation).length

  async function handleDelete(order) {
    setError('')
    const result = await deleteWithConfirmation(order)
    if (!result.ok && !result.cancelled) {
      setError(result.message)
    }
  }

  return (
    <div className="orders-page-container">
      <div className="orders-header-row">
        <div>
          <PageHeading title="Заявки на сесії" />
          <p className="field-hint">Нижче наведено перелік оформлених заявок на гру.</p>
        </div>
        <div className="orders-header-actions" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link to="/orders/new" className="app-button app-button-primary">
            <span>+ Створити заявку</span>
          </Link>
          <AppButton variant="secondary" onClick={() => void reload()} disabled={isMutating}>
            🔄 Оновити дані
          </AppButton>
        </div>
      </div>

      <div className="orders-stats-row">
        <div className="orders-stat-card">
          <span className="orders-stat-icon-wrap">
            <PackageIcon size={22} className="orders-stat-svg" />
          </span>
          <div>
            <span className="orders-stat-label">Усього заявок</span>
            <strong className="orders-stat-value">{userOrders.length}</strong>
          </div>
        </div>

        <div className="orders-stat-card">
          <div>
            <span className="orders-stat-label">В обробці</span>
            <strong className="orders-stat-value">{pendingCount}</strong>
          </div>
        </div>

        <div className="orders-stat-card">
          <div>
            <span className="orders-stat-label">З консультацією</span>
            <strong className="orders-stat-value">{consultationCount}</strong>
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
          Показано: <strong>{filters.visibleOrders.length}</strong> із {userOrders.length}
        </p>
      </div>

      {error && <p className="field-error form-top-error" role="alert">{error}</p>}

      {orders.length === 0 ? (
        <EmptyState title="Заявок ще немає">
          <p>
            <Link to="/games" className="app-button app-button-primary">
              <span>Оберіть настільну гру в каталозі для створення заявки</span>
              <span aria-hidden="true">→</span>
            </Link>
          </p>
        </EmptyState>
      ) : filters.visibleOrders.length === 0 ? (
        <EmptyState title="За цими умовами нічого не знайдено">
          <p>Спробуйте змінити пошуковий запит або скинути встановлені фільтри.</p>
          <AppButton variant="secondary" onClick={filters.resetFilters}>
            Показати всі заявки
          </AppButton>
        </EmptyState>
      ) : (
        <OrderTable
          orders={filters.visibleOrders}
          items={products}
          onDelete={handleDelete}
          isMutating={isMutating}
        />
      )}
    </div>
  )
}