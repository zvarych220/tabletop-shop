import AppButton from '../ui/AppButton.jsx'
import FormField from '../ui/FormField.jsx'

export default function OrderForm({
  idPrefix,
  draft,
  errors = {},
  operationError,
  isSubmitting,
  onChange,
  onBlur,
  onSubmit,
  onReset,
  submitLabel = 'Створити заявку',
}) {
  const commentId = `${idPrefix}-comment`
  const durationId = `${idPrefix}-duration`
  const consultationId = `${idPrefix}-consultation`
  const hasErrors = Object.keys(errors).length > 0

  function describedBy(id, error) {
    return `${id}-hint${error ? ` ${id}-error` : ''}`
  }

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="order-form-preview"
      aria-label="Форма оформлення заявки"
      aria-busy={isSubmitting}
    >
      <fieldset disabled={isSubmitting} className="form-fieldset" style={{ border: 'none', padding: 0, margin: 0 }}>
        <legend className="visually-hidden">Параметри заявки</legend>

        {hasErrors && <p className="field-error form-top-error" role="alert">Будь ласка, виправте виділені поля.</p>}
        {operationError && <p className="field-error form-top-error" role="alert">{operationError}</p>}

        <FormField
          id={commentId}
          label="Коментар (обов'язково)"
          hint="Вкажіть побажання, цілі сесії або список учасників"
          error={errors.comment}
        >
          <textarea
            id={commentId}
            name="comment"
            rows={3}
            value={draft.comment || ''}
            onChange={(e) => onChange('comment', e.target.value)}
            onBlur={() => onBlur?.('comment')}
            aria-invalid={Boolean(errors.comment)}
            aria-describedby={describedBy(commentId, errors.comment)}
            className={`form-textarea ${errors.comment ? 'input-invalid' : ''}`}
            placeholder="Введіть ваш коментар..."
          />
        </FormField>

        <FormField
          id={durationId}
          label="Тривалість сесії (годин, від 1 до 8)"
          hint="Запланований час гри (від 1 до 8 годин)"
          error={errors.durationHours}
        >
          <input
            id={durationId}
            name="durationHours"
            type="number"
            min={1}
            max={8}
            value={draft.durationHours ?? ''}
            onChange={(e) => onChange('durationHours', e.target.value)}
            onBlur={() => onBlur?.('durationHours')}
            aria-invalid={Boolean(errors.durationHours)}
            aria-describedby={describedBy(durationId, errors.durationHours)}
            className={`form-input ${errors.durationHours ? 'input-invalid' : ''}`}
          />
        </FormField>

        <div className="checkbox-field" style={{ margin: '1rem 0' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              id={consultationId}
              name="needsConsultation"
              type="checkbox"
              checked={Boolean(draft.needsConsultation)}
              onChange={(e) => onChange('needsConsultation', e.target.checked)}
              onBlur={() => onBlur?.('needsConsultation')}
              aria-invalid={Boolean(errors.needsConsultation)}
            />
            <span>Потрібна попередня консультація або ведучий гри</span>
          </label>
          {errors.needsConsultation && (
            <p className="field-error" role="alert" style={{ marginTop: '0.25rem' }}>
              {errors.needsConsultation}
            </p>
          )}
        </div>

        <div className="form-actions checkout-actions">
          <AppButton type="submit" variant="primary" disabled={isSubmitting}>
            <span>{isSubmitting ? 'Збереження…' : submitLabel}</span>
            <span aria-hidden="true">→</span>
          </AppButton>
          <AppButton type="button" variant="secondary" onClick={onReset} disabled={isSubmitting}>
            Очистити поля
          </AppButton>
        </div>
      </fieldset>
    </form>
  )
}