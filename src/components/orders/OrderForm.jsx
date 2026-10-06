import AppButton from '../ui/AppButton.jsx'
import FormField from '../ui/FormField.jsx'
import { ParcelIcon, PostIcon, CreditCardIcon, CashIcon } from '../ui/Icons.jsx'

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
  submitLabel = 'Підтвердити замовлення',
}) {
  const nameId = `${idPrefix}-fullname`
  const phoneId = `${idPrefix}-phone`
  const cityId = `${idPrefix}-city`
  const branchId = `${idPrefix}-branch`
  const commentId = `${idPrefix}-comment`
  const hasErrors = Object.keys(errors).length > 0

  function describedBy(id, error) {
    return `${id}-hint${error ? ` ${id}-error` : ''}`
  }

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="order-form-preview"
      aria-label="Форма оформлення покупки"
      aria-busy={isSubmitting}
    >
      <fieldset disabled={isSubmitting} className="form-fieldset" style={{ border: 'none', padding: 0, margin: 0 }}>
        <legend className="visually-hidden">Дані доставки та покупця</legend>

        {hasErrors && <p className="field-error form-top-error" role="alert">Будь ласка, виправте виділені поля.</p>}
        {operationError && <p className="field-error form-top-error" role="alert">{operationError}</p>}

        {/* 1. Дані одержувача */}
        <div className="checkout-form-section">
          <h3 className="checkout-section-title">1. Контактні дані одержувача</h3>

          <FormField
            id={nameId}
            label="Прізвище та ім'я (обов'язково)"
            hint="Наприклад: Коваленко Олексій"
            error={errors.fullName}
          >
            <input
              id={nameId}
              name="fullName"
              type="text"
              autoComplete="name"
              value={draft.fullName || ''}
              onChange={(e) => onChange('fullName', e.target.value)}
              onBlur={() => onBlur('fullName')}
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={describedBy(nameId, errors.fullName)}
              className={`form-input ${errors.fullName ? 'input-invalid' : ''}`}
              placeholder="Шевченко Тарас"
            />
          </FormField>

          <FormField
            id={phoneId}
            label="Номер телефону (обов'язково)"
            hint="Для сповіщення про прибуття посилки"
            error={errors.phone}
          >
            <input
              id={phoneId}
              name="phone"
              type="tel"
              autoComplete="tel"
              value={draft.phone || ''}
              onChange={(e) => onChange('phone', e.target.value)}
              onBlur={() => onBlur('phone')}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={describedBy(phoneId, errors.phone)}
              className={`form-input ${errors.phone ? 'input-invalid' : ''}`}
              placeholder="+380 50 123 45 67"
            />
          </FormField>
        </div>

        {/* 2. Доставка (Тільки Нова Пошта або Укрпошта) */}
        <div className="checkout-form-section">
          <h3 className="checkout-section-title">2. Служба та адреса доставки</h3>

          <div className="delivery-selection-group">
            <span className="delivery-label">Оберіть перевізника:</span>
            <div className="carrier-radio-cards">
              <label className={`carrier-radio-card ${draft.deliveryService === 'nova_poshta' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="deliveryService"
                  value="nova_poshta"
                  checked={draft.deliveryService === 'nova_poshta'}
                  onChange={() => onChange('deliveryService', 'nova_poshta')}
                  onBlur={() => onBlur('deliveryService')}
                />
                <div className="carrier-card-content">
                  <span className="carrier-name"><ParcelIcon size={16} className="carrier-icon-svg" /> Нова Пошта</span>
                  <span className="carrier-sub">1-2 дні • Відділення / Поштомат</span>
                </div>
              </label>

              <label className={`carrier-radio-card ${draft.deliveryService === 'ukr_poshta' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="deliveryService"
                  value="ukr_poshta"
                  checked={draft.deliveryService === 'ukr_poshta'}
                  onChange={() => onChange('deliveryService', 'ukr_poshta')}
                  onBlur={() => onBlur('deliveryService')}
                />
                <div className="carrier-card-content">
                  <span className="carrier-name"><PostIcon size={16} className="carrier-icon-svg" /> Укрпошта</span>
                  <span className="carrier-sub">2-4 дні • Стандарт</span>
                </div>
              </label>
            </div>
            {errors.deliveryService && (
              <p className="field-error" role="alert">{errors.deliveryService}</p>
            )}
          </div>

          <div className="form-two-col">
            <FormField
              id={cityId}
              label="Місто / Населений пункт (обов'язково)"
              hint="Наприклад: Київ, Львів, Одеса"
              error={errors.city}
            >
              <input
                id={cityId}
                name="city"
                type="text"
                value={draft.city || ''}
                onChange={(e) => onChange('city', e.target.value)}
                onBlur={() => onBlur('city')}
                aria-invalid={Boolean(errors.city)}
                aria-describedby={describedBy(cityId, errors.city)}
                className={`form-input ${errors.city ? 'input-invalid' : ''}`}
                placeholder="Київ"
              />
            </FormField>

            <FormField
              id={branchId}
              label="Відділення або поштомат (обов'язково)"
              hint="Наприклад: Відділення №25 або Поштомат 8241"
              error={errors.branch}
            >
              <input
                id={branchId}
                name="branch"
                type="text"
                value={draft.branch || ''}
                onChange={(e) => onChange('branch', e.target.value)}
                onBlur={() => onBlur('branch')}
                aria-invalid={Boolean(errors.branch)}
                aria-describedby={describedBy(branchId, errors.branch)}
                className={`form-input ${errors.branch ? 'input-invalid' : ''}`}
                placeholder="Відділення №15"
              />
            </FormField>
          </div>
        </div>

        {/* 3. Оплата та коментар */}
        <div className="checkout-form-section">
          <h3 className="checkout-section-title">3. Спосіб оплати та коментар</h3>

          <div className="payment-radio-group">
            <label className={`payment-radio-option ${draft.paymentMethod === 'cash_on_delivery' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="cash_on_delivery"
                checked={draft.paymentMethod === 'cash_on_delivery'}
                onChange={() => onChange('paymentMethod', 'cash_on_delivery')}
              />
              <span><CashIcon size={16} className="payment-method-svg" /> Оплата при отриманні (післяплата у відділенні)</span>
            </label>

            <label className={`payment-radio-option ${draft.paymentMethod === 'online' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="online"
                checked={draft.paymentMethod === 'online'}
                onChange={() => onChange('paymentMethod', 'online')}
              />
              <span><CreditCardIcon size={16} className="payment-method-svg" /> Онлайн-оплата картою (WayForPay / Apple Pay / Google Pay)</span>
            </label>
          </div>

          <FormField
            id={commentId}
            label="Коментар або побажання до доставки (необов'язково)"
            hint="Вкажіть особливі побажання, наприклад: додаткове пакування чи час дзвінка"
            error={errors.comment}
          >
            <textarea
              id={commentId}
              name="comment"
              rows={2}
              value={draft.comment || ''}
              onChange={(e) => onChange('comment', e.target.value)}
              onBlur={() => onBlur('comment')}
              aria-invalid={Boolean(errors.comment)}
              aria-describedby={describedBy(commentId, errors.comment)}
              className={`form-textarea ${errors.comment ? 'input-invalid' : ''}`}
              placeholder="Зателефонуйте перед відправкою, якщо виникнуть запитання..."
            />
          </FormField>
        </div>

        <div className="form-actions checkout-actions">
          <AppButton type="submit" variant="primary" disabled={isSubmitting}>
            <span>{isSubmitting ? 'Оформлення…' : submitLabel}</span>
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