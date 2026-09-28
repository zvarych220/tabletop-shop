import { Link } from 'react-router'
import PageHeading from '../components/ui/PageHeading.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { PackageIcon, MessageSquareIcon } from '../components/ui/Icons.jsx'

export default function OrdersPage({ orders, items }) {
  const needsConsultCount = orders.filter((o) => o.needsConsultation).length

  return (
    <div className="orders-page-container">
      <div className="orders-header-row">
        <div>
          <PageHeading title="Замовлення та броні" />
          <p className="field-hint">Нижче наведено перелік тестових заявок клієнтів магазину.</p>
        </div>
        <Link to="/orders/new" className="app-button app-button-primary">
          <span>+ Створити нову заявку</span>
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

      {orders.length === 0 ? (
        <EmptyState title="Немає активних замовлень">
          <Link to="/orders/new" className="app-button app-button-primary">
            Створити першу заявку
          </Link>
        </EmptyState>
      ) : (
        <div className="table-scroll-wrapper">
          <div className="table-scroll">
            <table className="requests-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Настільна гра</th>
                  <th>Коментар покупця</th>
                  <th>Консультація</th>
                  <th>Дія</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const game = items.find((g) => g.id === order.gameId)
                  return (
                    <tr key={order.id}>
                      <td className="cell-id">
                        <code className="order-id-badge">{order.id}</code>
                      </td>
                      <td className="cell-game">
                        <strong className="order-game-title">
                          {game?.title ?? 'Гру видалено з каталогу'}
                        </strong>
                        {game && (
                          <span className="order-game-category">{game.category} • {game.price} ₴</span>
                        )}
                      </td>
                      <td className="cell-comment">
                        <span className="comment-text">{order.comment}</span>
                      </td>
                      <td className="cell-consultation">
                        <span className={`consult-badge ${order.needsConsultation ? 'consult-needed' : 'consult-none'}`}>
                          {order.needsConsultation ? (
                            <>
                              <MessageSquareIcon size={13} className="consult-badge-svg" />
                              <span>Потрібна</span>
                            </>
                          ) : (
                            <span>Не потрібна</span>
                          )}
                        </span>
                      </td>
                      <td className="cell-actions">
                        <Link to={`/orders/${order.id}/edit`} className="edit-link">
                          <span>Редагувати</span>
                          <span aria-hidden="true">→</span>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}