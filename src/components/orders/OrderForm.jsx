import AppButton from '../ui/AppButton.jsx'
import FormField from '../ui/FormField.jsx'

export default function OrderForm({
  idPrefix,
  gameTitle,
  draft,
  onCommentChange,
  onNeedsConsultationChange,
  onReset,
}) {
  const nameId = `${idPrefix}-name`
  const commentId = `${idPrefix}-comment`
  const consultId = `${idPrefix}-consult`
  const noticeId = `${idPrefix}-notice`

  return (
    <form
      aria-label="Форма чернетки замовлення"
      aria-describedby={noticeId}
      onSubmit={(e) => e.preventDefault()}
      className="order-form-preview"
    >
      <p id={noticeId} className="preview-notice">
        ℹ️ Чернетка існує лише в пам'яті до зміни гри, очищення або перезавантаження сторінки.
      </p>

      <FormField id={nameId} label="Обрана гра">
        <input
          id={nameId}
          name="gameTitle"
          value={gameTitle}
          readOnly
          className="form-input read-only-input"
        />
      </FormField>

      <FormField
        id={commentId}
        label="Коментар або побажання"
        hint="Вкажіть побажання щодо мови правил чи адреси відділення"
      >
        <textarea
          id={commentId}
          name="comment"
          rows={3}
          value={draft.comment}
          onChange={(e) => onCommentChange(e.target.value)}
          aria-describedby={`${commentId}-hint`}
          className="form-textarea"
        />
      </FormField>

      <div className="checkbox-field">
        <input
          id={consultId}
          type="checkbox"
          checked={draft.needsConsultation}
          onChange={(e) => onNeedsConsultationChange(e.target.checked)}
        />
        <label htmlFor={consultId}>Потрібна консультація щодо протекторату або правил</label>
      </div>

      <div className="form-actions">
        <AppButton type="button" variant="secondary" onClick={onReset}>
          Очистити поля
        </AppButton>
        <AppButton disabled={true}>
          Надсилання буде доступне в Л 3.1
        </AppButton>
      </div>
    </form>
  )
}