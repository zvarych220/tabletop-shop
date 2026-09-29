import AppButton from '../ui/AppButton.jsx'
import FormField from '../ui/FormField.jsx'

export default function OrderForm({
  idPrefix,
  gameTitle,
  draft,
  errors = {},
  operationError,
  onChange,
  onBlur,
  onSubmit,
  onReset,
  submitLabel = 'Зберегти замовлення',
}) {
  const commentId = `${idPrefix}-comment`
  const hoursId = `${idPrefix}-hours`
  const consultId = `${idPrefix}-consult`
  const hasErrors = Object.keys(errors).length > 0

  function describedBy(id, error) {
    return `${id}-hint${error ? ` ${id}-error` : ''}`
  }

  return (
    <form noValidate onSubmit={onSubmit} className="order-form-preview" aria-label="Форма замовлення">
      <p className="preview-notice">
        Обрана гра: <strong>«{gameTitle}»</strong>. Дані зберігаються в локальній пам’яті застосунку.
      </p>

      {hasErrors && <p className="field-error form-top-error" role="alert">Будь ласка, виправте виділені поля.</p>}
      {operationError && <p className="field-error form-top-error" role="alert">{operationError}</p>}

      <FormField
        id={commentId}
        label="Коментар або побажання (обов'язково)"
        hint="Від 10 до 500 символів."
        error={errors.comment}
      >
        <textarea
          id={commentId}
          name="comment"
          rows={3}
          value={draft.comment}
          onChange={(e) => onChange('comment', e.target.value)}
          onBlur={() => onBlur('comment')}
          aria-invalid={Boolean(errors.comment)}
          aria-describedby={describedBy(commentId, errors.comment)}
          className={`form-textarea ${errors.comment ? 'input-invalid' : ''}`}
          placeholder="Вкажіть побажання щодо мови правил, складу гравців чи формату партії..."
        />
      </FormField>

      <FormField
        id={hoursId}
        label="Тривалість партії / броні в годинах (обов'язково)"
        hint="Ціле число від 1 до 8."
        error={errors.durationHours}
      >
        <input
          id={hoursId}
          name="durationHours"
          type="number"
          min={1}
          max={8}
          step={1}
          value={draft.durationHours}
          onChange={(e) => onChange('durationHours', e.target.value)}
          onBlur={() => onBlur('durationHours')}
          aria-invalid={Boolean(errors.durationHours)}
          aria-describedby={describedBy(hoursId, errors.durationHours)}
          className={`form-input ${errors.durationHours ? 'input-invalid' : ''}`}
        />
      </FormField>

      <div className="checkbox-field custom-checkbox">
        <input
          id={consultId}
          name="needsConsultation"
          type="checkbox"
          checked={draft.needsConsultation}
          onChange={(e) => onChange('needsConsultation', e.target.checked)}
          onBlur={() => onBlur('needsConsultation')}
          aria-invalid={Boolean(errors.needsConsultation)}
          aria-describedby={describedBy(consultId, errors.needsConsultation)}
        />
        <label htmlFor={consultId}>
          <span className="checkbox-text">Потрібна консультація гейм-майстра з правил</span>
        </label>
      </div>
      <p id={`${consultId}-hint`} className="field-hint">
        Для тривалості понад 4 години консультація обов'язкова.
      </p>
      {errors.needsConsultation && (
        <p id={`${consultId}-error`} className="field-error" role="alert">
          {errors.needsConsultation}
        </p>
      )}

      <div className="form-actions">
        <AppButton type="submit" variant="primary">
          <span>{submitLabel}</span>
          <span aria-hidden="true">→</span>
        </AppButton>
        <AppButton type="button" variant="secondary" onClick={onReset}>
          Відновити початкові поля
        </AppButton>
      </div>
    </form>
  )
}