import { Link } from 'react-router'
import AppButton from '../ui/AppButton.jsx'
import { MessageSquareIcon, ClockIcon } from '../ui/Icons.jsx'

export default function OrderTable({ orders, items, onDelete }) {
  return (
    <div className="table-scroll-wrapper">
      <div className="table-scroll">
        <table className="requests-table">
          <caption className="table-caption">Заявки поточної локальної колекції</caption>
          <thead>
            <tr>
              <th>ID</th>
              <th>Гра та коментар</th>
              <th>Тривалість</th>
              <th>Консультація</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const game = items.find((g) => g.id === order.gameId)
              const path = `/orders/${encodeURIComponent(order.id)}`

              return (
                <tr key={order.id}>
                  <td className="cell-id">
                    <code className="order-id-badge">{order.id}</code>
                  </td>
                  <td className="cell-game-comment">
                    <strong className="order-game-title">
                      {game?.title ?? 'Гру видалено'}
                    </strong>
                    <p className="table-cell-desc">{order.comment}</p>
                  </td>
                  <td className="cell-duration">
                    <span className="duration-pill">
                      <ClockIcon size={14} className="spec-icon-svg" />
                      <span>{order.durationHours} год.</span>
                    </span>
                  </td>
                  <td className="cell-consultation">
                    <span className={`consult-badge ${order.needsConsultation ? 'consult-needed' : 'consult-none'}`}>
                      {order.needsConsultation ? (
                        <>
                          <MessageSquareIcon size={13} className="consult-badge-svg" />
                          <span>Так</span>
                        </>
                      ) : (
                        <span>Ні</span>
                      )}
                    </span>
                  </td>
                  <td className="table-actions-cell">
                    <Link to={path} className="table-action-link">
                      Переглянути
                    </Link>
                    <Link to={`${path}/edit`} className="table-action-link">
                      Редагувати
                    </Link>
                    <AppButton
                      variant="secondary"
                      onClick={() => onDelete(order)}
                      className="table-delete-btn"
                    >
                      Видалити
                    </AppButton>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
