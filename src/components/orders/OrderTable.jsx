import { Link } from 'react-router'
import AppButton from '../ui/AppButton.jsx'
import { TruckIcon } from '../ui/Icons.jsx'

export default function OrderTable({ orders, items, onDelete }) {
  return (
    <div className="table-scroll-wrapper">
      <div className="table-scroll">
        <table className="requests-table">
          <caption className="table-caption">Перелік оформлених замовлень на покупку</caption>
          <thead>
            <tr>
              <th>ID</th>
              <th>Одержувач та телефон</th>
              <th>Доставка та місто</th>
              <th>Товари та сума</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const path = `/orders/${encodeURIComponent(order.id)}`
              const game = items.find((g) => g.id === order.gameId)
              const effectiveItems = order.orderedItems?.length > 0
                ? order.orderedItems
                : game
                ? [{ title: game.title, quantity: 1, price: game.price }]
                : []

              const total = order.totalPrice || effectiveItems.reduce((acc, it) => acc + (it.price || 0) * (it.quantity || 1), 0)
              const deliveryLabel = order.deliveryService === 'ukr_poshta' ? 'Укрпошта' : 'Нова Пошта'

              return (
                <tr key={order.id}>
                  <td className="cell-id">
                    <code className="order-id-badge">{order.id}</code>
                  </td>
                  <td className="cell-customer">
                    <strong className="order-customer-name">
                      {order.fullName || 'Клієнт магазину'}
                    </strong>
                    <p className="table-cell-desc">{order.phone || '—'}</p>
                  </td>
                  <td className="cell-delivery">
                    <span className="delivery-pill">
                      <TruckIcon size={14} className="spec-icon-svg" />
                      <span>{deliveryLabel}</span>
                    </span>
                    <p className="table-cell-desc">
                      {order.city ? `${order.city}, ${order.branch}` : 'Адреса уточнюється'}
                    </p>
                  </td>
                  <td className="cell-items-total">
                    <div className="order-items-snippet">
                      {effectiveItems.length > 0 ? (
                        effectiveItems.map((it, i) => (
                          <span key={i} className="item-snippet-tag">
                            {it.title} (×{it.quantity || 1})
                          </span>
                        ))
                      ) : (
                        <span>{game?.title ?? 'Товар'}</span>
                      )}
                    </div>
                    <strong className="order-total-price-tag">{total} ₴</strong>
                  </td>
                  <td className="table-actions-cell">
                    <Link to={path} className="table-action-link">
                      Деталі
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
