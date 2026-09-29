import { ReceiptIcon, MessageSquareIcon, ZapIcon, ClockIcon } from '../ui/Icons.jsx'

export default function OrderSummary({ gameTitle, draft }) {
  const cleanComment = draft.comment ? draft.comment.trim() : ''

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
            {cleanComment || 'Ще не вказано'}
          </dd>
        </div>
        <div className="summary-row">
          <dt>Тривалість:</dt>
          <dd>
            {draft.durationHours ? (
              <span className="summary-duration-tag">
                <ClockIcon size={13} className="spec-icon-svg" />
                <span>{draft.durationHours} год.</span>
              </span>
            ) : (
              'Не вказано'
            )}
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
          <span>Дані синхронізуються з формою наживо.</span>
        </small>
      </div>
    </div>
  )
}