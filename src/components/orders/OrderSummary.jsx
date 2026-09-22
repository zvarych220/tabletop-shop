export default function OrderSummary({ gameTitle, draft }) {
  const cleanComment = draft.comment.trim()

  return (
    <div className="order-summary-box">
      <h4>Поточна чернетка</h4>
      <dl>
        <dt>Гра:</dt>
        <dd>{gameTitle}</dd>
        <dt>Коментар:</dt>
        <dd>{cleanComment || 'Не вказано'}</dd>
        <dt>Консультація гейм-майстра:</dt>
        <dd>{draft.needsConsultation ? 'Потрібна' : 'Не потрібна'}</dd>
      </dl>
      <small className="field-hint">Цей підсумок синхронізовано з полями форми наживо.</small>
    </div>
  )
}