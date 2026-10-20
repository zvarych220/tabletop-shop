import OrderRow from './OrderRow.jsx'

export default function OrderTable({ orders, items, onDelete, isMutating }) {
  const titles = new Map((items || []).map((item) => [String(item.id), item.title]))

  function getOrderTitle(order) {
    if (order.orderedItems && order.orderedItems.length > 0) {
      return order.orderedItems
        .map((item) => `${item.title}${item.quantity > 1 ? ` ×${item.quantity}` : ''}`)
        .join(', ')
    }
    if (order.gameId) {
      return titles.get(String(order.gameId)) || titles.get(order.gameId) || order.gameId
    }
    return 'Невідома гра'
  }

  return (
    <div className="table-scroll-wrapper">
      <div className="table-scroll">
        <table className="requests-table">
          <caption className="table-caption">Перелік оформлених замовлень</caption>
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
            {orders.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                gameTitle={getOrderTitle(order)}
                onDelete={onDelete}
                isMutating={isMutating}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
