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
import { PackageIcon, TruckIcon, CoinsAltIcon } from '../components/ui/Icons.jsx'
import { failNextMockOrder } from '../services/mockOrderService.js'

export default function OrdersPage({ items }) {
  const { orders, reload, isMutating } = useOrders()
  const filters = useOrderFilters(orders, items)
  const deleteWithConfirmation = useDeleteOrder(items)
  const [error, setError] = useState('')

  const novaPoshtaCount = orders.filter((o) => o.deliveryService !== 'ukr_poshta').length
  const ukrPoshtaCount = orders.filter((o) => o.deliveryService === 'ukr_poshta').length
  const totalRevenue = orders.reduce((acc, o) => acc + (o.totalPrice || 2150), 0)

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
          <PageHeading title="Замовлення та покупки" />
          <p className="field-hint">Нижче наведено перелік оформлених замовлень на покупку настільних ігор.</p>
        </div>
        <div className="orders-header-actions" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link to="/orders/new" className="app-button app-button-primary">
            <span>+ Створити замовлення</span>
          </Link>
          <AppButton variant="secondary" onClick={() => void reload()} disabled={isMutating}>
            🔄 Оновити дані
          </AppButton>
          {import.meta.env.DEV && import.meta.env.VITE_DATA_SOURCE === 'mock' && (
            <AppButton
              variant="secondary"
              onClick={() => {
                failNextMockOrder('getAll')
                void reload()
              }}
            >
              ⚠️ Тест помилки мережі
            </AppButton>
          )}
        </div>
      </div>

      <div className="orders-stats-row">
        <div className="orders-stat-card">
          <span className="orders-stat-icon-wrap">
            <PackageIcon size={22} className="orders-stat-svg" />
          </span>
          <div>
            <span className="orders-stat-label">Усього покупок</span>
            <strong className="orders-stat-value">{orders.length}</strong>
          </div>
        </div>

        <div className="orders-stat-card">
          <span className="orders-stat-icon-wrap">
            <TruckIcon size={22} className="orders-stat-svg" />
          </span>
          <div>
            <span className="orders-stat-label">Нова Пошта</span>
            <strong className="orders-stat-value">{novaPoshtaCount}</strong>
          </div>
        </div>

        <div className="orders-stat-card">
          <span className="orders-stat-icon-wrap">
            <TruckIcon size={22} className="orders-stat-svg" />
          </span>
          <div>
            <span className="orders-stat-label">Укрпошта</span>
            <strong className="orders-stat-value">{ukrPoshtaCount}</strong>
          </div>
        </div>

        <div className="orders-stat-card">
          <span className="orders-stat-icon-wrap" style={{ color: '#059669' }}>
            <CoinsAltIcon size={22} />
          </span>
          <div>
            <span className="orders-stat-label">Загальний виторг</span>
            <strong className="orders-stat-value">{totalRevenue} ₴</strong>
          </div>
        </div>
      </div>

      <OrderFilters
        query={filters.query}
        carrier={filters.carrier}
        sort={filters.sort}
        onQueryChange={filters.setQuery}
        onCarrierChange={filters.setCarrier}
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
        <EmptyState title="Замовлень ще немає">
          <p>
            <Link to="/games" className="app-button app-button-primary">
              <span>Оберіть настільну гру в каталозі для першої покупки</span>
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