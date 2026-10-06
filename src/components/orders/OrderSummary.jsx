import { ReceiptIcon, ZapIcon, ParcelIcon, PostIcon, CreditCardIcon, CashIcon, CheckCircleIcon } from '../ui/Icons.jsx'

export default function OrderSummary({ draft, orderedItems = [] }) {
  const deliveryName =
    draft.deliveryService === 'ukr_poshta' ? 'Укрпошта' : 'Нова Пошта'
  const DeliveryIcon = draft.deliveryService === 'ukr_poshta' ? PostIcon : ParcelIcon

  const total = orderedItems.reduce((acc, it) => acc + it.price * (it.quantity || 1), 0)


  return (
    <div className="order-summary-box">
      <div className="order-summary-header">
        <div className="summary-title-group">
          <ReceiptIcon size={18} className="summary-receipt-svg" />
          <h4>Підсумок покупки</h4>
        </div>
        <span className="live-indicator">
          <span className="live-pulse"></span>
          <span>Наживо</span>
        </span>
      </div>

      {/* Ordered games list */}
      <div className="summary-items-list">
        <span className="summary-items-title">Товари в чеку:</span>
        {orderedItems.map((item, idx) => (
          <div key={idx} className="summary-item-line">
            <span className="summary-item-name">
              {item.title} <small>× {item.quantity || 1}</small>
            </span>
            <strong className="summary-item-price">
              {item.price * (item.quantity || 1)} ₴
            </strong>
          </div>
        ))}
      </div>

      <dl className="order-summary-dl">
        <div className="summary-row">
          <dt>Одержувач:</dt>
          <dd>{draft.fullName ? <strong>{draft.fullName}</strong> : <span className="summary-empty">Не вказано</span>}</dd>
        </div>

        <div className="summary-row">
          <dt>Телефон:</dt>
          <dd>{draft.phone || <span className="summary-empty">Не вказано</span>}</dd>
        </div>

        <div className="summary-row">
          <dt>Доставка:</dt>
          <dd><DeliveryIcon size={14} className="summary-delivery-svg" /> {deliveryName}</dd>
        </div>

        <div className="summary-row">
          <dt>Місто та адреса:</dt>
          <dd>
            {draft.city ? `${draft.city}, ${draft.branch || ''}` : <span className="summary-empty">Не вказано</span>}
          </dd>
        </div>

        <div className="summary-row">
          <dt>Оплата:</dt>
          <dd>
            {draft.paymentMethod === 'online'
              ? <><CreditCardIcon size={14} className="summary-pay-svg" /> Онлайн-оплата</>
              : <><CashIcon size={14} className="summary-pay-svg" /> При отриманні</>}
          </dd>
        </div>

        <div className="summary-row summary-total-row">
          <dt>До сплати:</dt>
          <dd><strong className="summary-total-num">{total} ₴</strong></dd>
        </div>
      </dl>

      <div className="summary-footer-notice">
        <small className="field-hint">
          {total >= 1500 ? (
            <span style={{ color: '#059669', fontWeight: 600 }}>
              <CheckCircleIcon size={13} className="summary-notice-svg" />
              Безкоштовна доставка активна!
            </span>
          ) : (
            <span>
              <ZapIcon size={13} className="summary-notice-svg" />
              Доставка оплачується за тарифами перевізника.
            </span>
          )}
        </small>
      </div>
    </div>
  )
}