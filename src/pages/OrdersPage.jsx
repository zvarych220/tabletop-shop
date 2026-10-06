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
import { failNextMockOrder } from '../services/mockOrderService.js'

export default function OrdersPage({ items }) {
  const { orders, reload, isMutating } = useOrders()
  const filters = useOrderFilters(orders, items)
  const deleteWithConfirmation = useDeleteOrder(items)
  const [error, setError] = useState('')

  async function handleDelete(order) {
    setError('')
    const result = await deleteWithConfirmation(order)
    if (!result.ok && !result.cancelled) setError(result.message)
  }

  return (
    <>
      <PageHeading title="Замовлення та броні" />
      <div className="orders-header-bar">
        <Link to="/orders/new" className="app-button app-button-primary">
          + Створити нове замовлення
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

      <OrderFilters
        query={filters.query}
        consultation={filters.consultation}
        sort={filters.sort}
        onQueryChange={filters.setQuery}
        onConsultationChange={filters.setConsultation}
        onSortChange={filters.setSort}
        onReset={filters.resetFilters}
      />

      <p className="items-count-badge">
        Показано: {filters.visibleOrders.length} із {orders.length}
      </p>

      {error && <p className="field-error" role="alert">{error}</p>}

      {orders.length === 0 ? (
        <EmptyState title="Заявок ще немає">
          <p><Link to="/games">Оберіть настільну гру в каталозі для першої заявки</Link></p>
        </EmptyState>
      ) : filters.visibleOrders.length === 0 ? (
        <EmptyState title="За цими умовами нічого не знайдено">
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
    </>
  )
}