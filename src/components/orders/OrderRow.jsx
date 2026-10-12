import { memo } from 'react'
import { Link } from 'react-router'
import AppButton from '../ui/AppButton.jsx'

function OrderRow({ order, gameTitle, onDelete, isMutating }) {
  const path = `/orders/${encodeURIComponent(order.id)}`

  return (
    <tr>
      <td><code>{order.id}</code></td>
      <td>
        <strong>{gameTitle}</strong>
        <p className="table-cell-desc">{order.comment}</p>
      </td>
      <td>{order.durationHours} год.</td>
      <td>{order.needsConsultation ? 'Так' : 'Ні'}</td>
      <td className="table-actions-cell">
        <Link to={path} className="table-action-link">Переглянути</Link>
        <Link to={`${path}/edit`} className="table-action-link">Редагувати</Link>
        <AppButton variant="secondary" onClick={() => onDelete(order)} disabled={isMutating}>
          Видалити
        </AppButton>
      </td>
    </tr>
  )
}

export default memo(OrderRow)
