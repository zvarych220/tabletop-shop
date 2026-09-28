import { Link, useNavigate, useSearchParams } from 'react-router'
import PageHeading from '../components/ui/PageHeading.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import useBoardGameSelection from '../hooks/useBoardGameSelection.js'
import OrderPage from './OrderPage.jsx'
import NotFoundPage from './NotFoundPage.jsx'

export default function OrderCreatePage({ items }) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { selectedId, clearSelection } = useBoardGameSelection()

  const gameId = searchParams.get('gameId')

  if (!gameId) {
    return (
      <div className="order-create-empty">
        <PageHeading title="Оформлення нового замовлення" />
        <EmptyState title="Гру не вказано в параметрах адреси">
          <p>Щоб оформити замовлення, оберіть гру в каталозі або скористайтеся останнім вибором.</p>
          <div className="action-links">
            <Link to="/games" className="app-button app-button-primary">
              Відкрити каталог ігор
            </Link>
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

  const game = items.find((entry) => entry.id === gameId)

  if (!game) {
    return (
      <NotFoundPage
        title="Гру не знайдено"
        message={`Гру з ID «${gameId}» не знайдено для формування замовлення.`}
      />
    )
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
      onCancel={handleCancel}
    />
  )
}