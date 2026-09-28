import { ReceiptIcon, MessageSquareIcon, ZapIcon } from '../ui/Icons.jsx'

export default function OrderSummary({ gameTitle, draft }) {
  const cleanComment = draft.comment.trim()

  return (
    <div className="order-summary-box">
      <div className="order-summary-header">
        <div className="summary-title-group">
          <ReceiptIcon size={18} className="summary-receipt-svg" />
          <h4>Поточна чернетка</h4>
        </div>
        <span className="live-indicator">
          <span className="live-pulse"></span>
          <span>Наживо</span>
        </span>
      </div>
      <dl className="order-summary-dl">
        <div className="summary-row">
          <dt>Гра:</dt>
          <dd><strong>{gameTitle}</strong></dd>
        </div>
        <div className="summary-row">
          <dt>Коментар:</dt>
          <dd className={cleanComment ? 'summary-comment' : 'summary-empty'}>
            {cleanComment || 'Не вказано'}
          </dd>
        </div>
        <div className="summary-row">
          <dt>Консультація:</dt>
          <dd>
            <span className={`consult-badge ${draft.needsConsultation ? 'consult-needed' : 'consult-none'}`}>
              {draft.needsConsultation ? (
                <>
                  <MessageSquareIcon size={13} className="consult-badge-svg" />
                  <span>Потрібна</span>
                </>
              ) : (
                <span>Не потрібна</span>
              )}
            </span>
          </dd>
        </div>
      </dl>
      <div className="summary-footer-notice">
        <small className="field-hint">
          <ZapIcon size={13} className="summary-notice-svg" />
          <span>Підсумок автоматично оновлюється при введенні тексту.</span>
        </small>
      </div>
    </div>
  )
}