import useOrders from '../../hooks/useOrders.js'
import AppButton from '../ui/AppButton.jsx'

export default function OrdersGate({ children }) {
  const { status, error, reload } = useOrders()

  if (status === 'loading') {
    return (
      <div className="orders-loading-state" role="status">
        <p className="loading-spinner-text">⏳ Завантаження списку замовлень…</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="orders-error-state" role="alert">
        <p className="field-error">❌ {error}</p>
        <AppButton variant="secondary" onClick={() => void reload()}>
          Спробувати ще раз
        </AppButton>
      </div>
    )
  }

  return children
}
