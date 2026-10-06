import { useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import PageHeading from '../components/ui/PageHeading.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import useBoardGameSelection from '../hooks/useBoardGameSelection.js'
import useOrders from '../hooks/useOrders.js'
import OrderPage from './OrderPage.jsx'
import NotFoundPage from './NotFoundPage.jsx'

export default function OrderCreatePage({ items }) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { selectedId, clearSelection } = useBoardGameSelection()
  const { createOrder } = useOrders()
  const pageAlive = useRef(false)

  useEffect(() => {
    pageAlive.current = true
    return () => {
      pageAlive.current = false
    }
  }, [])

  const gameId = searchParams.get('gameId')

  if (!gameId) {
    return (
      <div className="order-create-empty">
        <PageHeading title="Створення нового замовлення" />
        <EmptyState title="Гру не вказано">
          <p>Оберіть гру в каталозі або скористайтеся останнім вибором:</p>
          <div className="action-links">
            <Link to="/games" className="app-button app-button-primary">До каталогу</Link>
            {selectedId && (
              <Link to={`/orders/new?gameId=${selectedId}`} className="app-button app-button-secondary">
                Використати останній вибір ({selectedId})
              </Link>
            )}
          </div>
        </EmptyState>
      </div>
    )
  }

  const game = items.find((g) => g.id === gameId)
  if (!game) {
    return <NotFoundPage title="Гру не знайдено" message={`Гру з ID ${gameId} не знайдено в каталозі.`} />
  }

  async function handleSave(input) {
    const result = await createOrder(input)
    if (result.ok && pageAlive.current) {
      navigate(`/orders/${encodeURIComponent(result.record.id)}`, { replace: true })
    }
    return result
  }

  function handleCancel() {
    clearSelection()
    navigate('/games', { replace: true })
  }

  return (
    <OrderPage
      key={`new-${game.id}`}
      title="Створення нового замовлення"
      game={game}
      onSave={handleSave}
      onCancel={handleCancel}
      submitLabel="Створити заявку"
      cancelLabel="Скасувати вибір"
    />
  )
}