import OrderRow from './OrderRow.jsx'

export default function OrderTable({ orders, items, onDelete, isMutating }) {
  const titles = new Map(items.map((item) => [item.id, item.title]))

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
                gameTitle={titles.get(order.gameId) ?? 'Невідома гра'}
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
