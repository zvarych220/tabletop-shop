import AppButton from '../ui/AppButton.jsx'
import FormField from '../ui/FormField.jsx'

export default function OrderFormPreview({ idPrefix, gameTitle }) {
  const nameId = `${idPrefix}-name`
  const phoneId = `${idPrefix}-phone`
  const commentId = `${idPrefix}-comment`
  const noticeId = `${idPrefix}-notice`

  return (
    <form
      aria-label="Макет оформлення замовлення"
      aria-describedby={noticeId}
      onSubmit={(e) => e.preventDefault()}
      className="order-form-preview"
    >
      <p id={noticeId} className="preview-notice">
        ℹ️ <em>Це демонстраційний макет форми. Дані не зберігаються (валідацію буде додано в Л 3.1).</em>
      </p>

      <FormField id={nameId} label="Обрана настільна гра">
        <input
          id={nameId}
          name="gameTitle"
          value={gameTitle}
          readOnly
          className="form-input read-only-input"
        />
      </FormField>

      <FormField id={phoneId} label="Контактний телефон" hint="У форматі +380XXXXXXXXX">
        <input
          id={phoneId}
          name="phone"
          type="tel"
          placeholder="+380..."
          defaultValue=""
          aria-describedby={`${phoneId}-hint`}
          className="form-input"
        />
      </FormField>

      <FormField id={commentId} label="Коментар до замовлення" hint="Вкажіть побажання щодо доставки або мови видання">
        <textarea
          id={commentId}
          name="comment"
          rows={3}
          defaultValue=""
          aria-describedby={`${commentId}-hint`}
          className="form-textarea"
        />
      </FormField>

      <div className="form-actions">
        <AppButton type="reset" variant="secondary">
          Очистити поля
        </AppButton>
        <AppButton disabled={true}>
          Оформити замовлення (недоступно)
        </AppButton>
      </div>
    </form>
  )
}