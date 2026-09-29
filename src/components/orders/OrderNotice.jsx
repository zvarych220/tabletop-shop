import useOrders from '../../hooks/useOrders.js'
import AppButton from '../ui/AppButton.jsx'
import { CheckIcon } from '../ui/Icons.jsx'

export default function OrderNotice() {
  const { notice, dismissNotice } = useOrders()
  if (!notice) return null

  return (
    <div className="operation-notice" role="status">
      <div className="operation-notice-text">
        <CheckIcon size={16} className="notice-check-icon" />
        <span>{notice}</span>
      </div>
      <AppButton variant="secondary" onClick={dismissNotice} aria-label="Закрити сповіщення">
        ✕
      </AppButton>
    </div>
  )
}
