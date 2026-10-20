import AppButton from '../ui/AppButton.jsx'
import FormField from '../ui/FormField.jsx'
import {
  UserIcon,
  TruckIcon,
  CreditCardIcon,
  MessageSquareIcon,
  ParcelIcon,
  PostIcon,
  CashIcon,
  ClockIcon,
} from '../ui/Icons.jsx'

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
  submitLabel = 'Оформити замовлення',
}) {
  const fullNameId = `${idPrefix}-fullName`
  const phoneId = `${idPrefix}-phone`
  const deliveryServiceId = `${idPrefix}-deliveryService`
  const cityId = `${idPrefix}-city`
  const branchId = `${idPrefix}-branch`
  const paymentMethodId = `${idPrefix}-paymentMethod`
  const commentId = `${idPrefix}-comment`
  const durationId = `${idPrefix}-duration`
  const consultationId = `${idPrefix}-consultation`
  const hasErrors = Object.keys(errors).length > 0

  function describedBy(id, error) {
    return `${id}-hint${error ? ` ${id}-error` : ''}`
  }

  const selectedDelivery = draft.deliveryService || 'nova_poshta'
  const selectedPayment = draft.paymentMethod || 'cash_on_delivery'

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="checkout-form"
      aria-label="Форма оформлення заявки"
      aria-busy={isSubmitting}
    >
      <fieldset disabled={isSubmitting} className="checkout-fieldset" style={{ border: 'none', padding: 0, margin: 0 }}>
        <legend className="visually-hidden">Параметри оформлення замовлення</legend>

        {/* Global Error Banner */}
        {hasErrors && (
          <div className="checkout-alert checkout-alert--warning" role="alert">
            <span className="checkout-alert-icon">⚠️</span>
            <div>
              <strong>Будь ласка, перевірте форму</strong>
              <p>Деякі обов'язкові поля заповнені некоректно або пропущені.</p>
            </div>
          </div>
        )}

        {operationError && (
          <div className="checkout-alert checkout-alert--danger" role="alert">
            <span className="checkout-alert-icon">❌</span>
            <div>
              <strong>Помилка збереження</strong>
              <p>{operationError}</p>
            </div>
          </div>
        )}

        {/* БЛОК 1: Контактні дані */}
        <section className="checkout-card" aria-labelledby={`${idPrefix}-contact-heading`}>
          <div className="checkout-card-header">
            <span className="checkout-step-badge">1</span>
            <div className="checkout-card-titles">
              <h3 id={`${idPrefix}-contact-heading`} className="checkout-card-title">
                <UserIcon size={18} className="checkout-title-icon" />
                <span>Контактні дані</span>
              </h3>
              <p className="checkout-card-subtitle">Вкажіть дані одержувача посилки для зв'язку та видачі</p>
            </div>
          </div>

          <div className="checkout-card-body">
            <div className="checkout-two-col">
              <FormField
                id={fullNameId}
                label="ПІБ отримувача *"
                hint="Прізвище та ім'я для отримання посилки"
                error={errors.fullName}
              >
                <input
                  id={fullNameId}
                  name="fullName"
                  type="text"
                  value={draft.fullName || ''}
                  onChange={(e) => onChange('fullName', e.target.value)}
                  onBlur={() => onBlur?.('fullName')}
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={describedBy(fullNameId, errors.fullName)}
                  className={`form-input ${errors.fullName ? 'input-invalid' : ''}`}
                  placeholder="Тарас Шевченко"
                  autoComplete="name"
                />
              </FormField>

              <FormField
                id={phoneId}
                label="Телефон *"
                hint="Номер телефону для сповіщень та SMS"
                error={errors.phone}
              >
                <input
                  id={phoneId}
                  name="phone"
                  type="tel"
                  value={draft.phone || ''}
                  onChange={(e) => onChange('phone', e.target.value)}
                  onBlur={() => onBlur?.('phone')}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={describedBy(phoneId, errors.phone)}
                  className={`form-input ${errors.phone ? 'input-invalid' : ''}`}
                  placeholder="+380 50 123 45 67"
                  autoComplete="tel"
                />
              </FormField>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <FormField
                id={`${idPrefix}-telegramChatId`}
                label="Telegram Chat ID (для сповіщень)"
              >
                <input
                  id={`${idPrefix}-telegramChatId`}
                  name="telegramChatId"
                  type="text"
                  value={draft.telegramChatId || ''}
                  onChange={(e) => onChange('telegramChatId', e.target.value)}
                  className="form-input"
                  placeholder="Наприклад: 123456789"
                />
                <div style={{
                  marginTop: '0.6rem',
                  padding: '0.7rem 0.9rem',
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  color: '#0369a1',
                  lineHeight: 1.55,
                }}>
                  📱 Щоб отримувати сповіщення про замовлення у Telegram:
                  <div style={{ marginTop: '0.3rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <span>
                      1.{' '}
                      <a
                        href="https://t.me/DiceDeck_bot"
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#0284c7', fontWeight: 600, textDecoration: 'none' }}
                      >
                        Підпишіться на нашого бота @DiceDeck_bot
                      </a>
                      {' '}та натисніть <strong>/start</strong>
                    </span>
                    <span>
                      2. Дізнайтеся свій Chat ID у{' '}
                      <a
                        href="https://t.me/userinfobot"
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#0284c7', fontWeight: 600, textDecoration: 'none' }}
                      >
                        @userinfobot
                      </a>
                      {' '}та вставте число вище
                    </span>
                  </div>
                </div>
              </FormField>
            </div>
          </div>
        </section>

        {/* БЛОК 2: Спосіб доставки */}
        <section className="checkout-card" aria-labelledby={`${idPrefix}-delivery-heading`}>
          <div className="checkout-card-header">
            <span className="checkout-step-badge">2</span>
            <div className="checkout-card-titles">
              <h3 id={`${idPrefix}-delivery-heading`} className="checkout-card-title">
                <TruckIcon size={18} className="checkout-title-icon" />
                <span>Спосіб доставки</span>
              </h3>
              <p className="checkout-card-subtitle">Оберіть перевізника та вкажіть населений пункт і відділення</p>
            </div>
          </div>

          <div className="checkout-card-body">
            <div className="checkout-field-group">
              <label className="checkout-group-label" htmlFor={deliveryServiceId}>
                Служба доставки *
              </label>

              {/* Accessible select for form automation/screen readers */}
              <select
                id={deliveryServiceId}
                name="deliveryService"
                value={selectedDelivery}
                onChange={(e) => onChange('deliveryService', e.target.value)}
                onBlur={() => onBlur?.('deliveryService')}
                className="visually-hidden"
                tabIndex={-1}
                aria-hidden="true"
              >
                <option value="nova_poshta">Нова Пошта</option>
                <option value="ukr_poshta">Укрпошта</option>
              </select>

              {/* Interactive Radio Cards */}
              <div className="carrier-cards-grid" role="radiogroup" aria-label="Вибір служби доставки">
                <button
                  type="button"
                  role="radio"
                  aria-checked={selectedDelivery === 'nova_poshta'}
                  className={`carrier-card ${selectedDelivery === 'nova_poshta' ? 'carrier-card--active' : ''}`}
                  onClick={() => {
                    onChange('deliveryService', 'nova_poshta')
                    onBlur?.('deliveryService')
                  }}
                >
                  <div className="carrier-card-radio-circle">
                    {selectedDelivery === 'nova_poshta' && <span className="radio-inner-dot" />}
                  </div>
                  <div className="carrier-card-icon-box carrier-card-icon--np">
                    <ParcelIcon size={22} />
                  </div>
                  <div className="carrier-card-info">
                    <div className="carrier-card-top">
                      <strong className="carrier-card-name">Нова Пошта</strong>
                      <span className="carrier-card-badge">1–2 дні</span>
                    </div>
                    <span className="carrier-card-desc">У відділення або поштомат по всій Україні</span>
                  </div>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={selectedDelivery === 'ukr_poshta'}
                  className={`carrier-card ${selectedDelivery === 'ukr_poshta' ? 'carrier-card--active' : ''}`}
                  onClick={() => {
                    onChange('deliveryService', 'ukr_poshta')
                    onBlur?.('deliveryService')
                  }}
                >
                  <div className="carrier-card-radio-circle">
                    {selectedDelivery === 'ukr_poshta' && <span className="radio-inner-dot" />}
                  </div>
                  <div className="carrier-card-icon-box carrier-card-icon--up">
                    <PostIcon size={22} />
                  </div>
                  <div className="carrier-card-info">
                    <div className="carrier-card-top">
                      <strong className="carrier-card-name">Укрпошта</strong>
                      <span className="carrier-card-badge carrier-card-badge--up">2–4 дні</span>
                    </div>
                    <span className="carrier-card-desc">У найближче стаціонарне відділення</span>
                  </div>
                </button>
              </div>

              {errors.deliveryService && (
                <p className="field-error" role="alert" style={{ marginTop: '0.5rem' }}>
                  {errors.deliveryService}
                </p>
              )}
            </div>

            {/* City & Branch */}
            <div className="checkout-two-col" style={{ marginTop: '1.25rem' }}>
              <FormField
                id={cityId}
                label="Місто / Населений пункт *"
                hint="Наприклад: Київ, Львів, Одеса"
                error={errors.city}
              >
                <input
                  id={cityId}
                  name="city"
                  type="text"
                  value={draft.city || ''}
                  onChange={(e) => onChange('city', e.target.value)}
                  onBlur={() => onBlur?.('city')}
                  aria-invalid={Boolean(errors.city)}
                  aria-describedby={describedBy(cityId, errors.city)}
                  className={`form-input ${errors.city ? 'input-invalid' : ''}`}
                  placeholder="Київ"
                  autoComplete="address-level2"
                />
              </FormField>

              <FormField
                id={branchId}
                label="Відділення або поштомат *"
                hint="Номер або адреса відділення перевізника"
                error={errors.branch}
              >
                <input
                  id={branchId}
                  name="branch"
                  type="text"
                  value={draft.branch || ''}
                  onChange={(e) => onChange('branch', e.target.value)}
                  onBlur={() => onBlur?.('branch')}
                  aria-invalid={Boolean(errors.branch)}
                  aria-describedby={describedBy(branchId, errors.branch)}
                  className={`form-input ${errors.branch ? 'input-invalid' : ''}`}
                  placeholder="Відділення №42 або Поштомат №1200"
                />
              </FormField>
            </div>
          </div>
        </section>

        {/* БЛОК 3: Спосіб оплати */}
        <section className="checkout-card" aria-labelledby={`${idPrefix}-payment-heading`}>
          <div className="checkout-card-header">
            <span className="checkout-step-badge">3</span>
            <div className="checkout-card-titles">
              <h3 id={`${idPrefix}-payment-heading`} className="checkout-card-title">
                <CreditCardIcon size={18} className="checkout-title-icon" />
                <span>Спосіб оплати</span>
              </h3>
              <p className="checkout-card-subtitle">Оберіть найзручніший для вас спосіб розрахунку</p>
            </div>
          </div>

          <div className="checkout-card-body">
            {/* Accessible hidden select */}
            <select
              id={paymentMethodId}
              name="paymentMethod"
              value={selectedPayment}
              onChange={(e) => onChange('paymentMethod', e.target.value)}
              onBlur={() => onBlur?.('paymentMethod')}
              className="visually-hidden"
              tabIndex={-1}
              aria-hidden="true"
            >
              <option value="cash_on_delivery">Оплата при отриманні (готівка)</option>
              <option value="online">Онлайн оплата (Visa/Mastercard)</option>
            </select>

            <div className="payment-cards-grid" role="radiogroup" aria-label="Вибір способу оплати">
              <button
                type="button"
                role="radio"
                aria-checked={selectedPayment === 'cash_on_delivery'}
                className={`payment-card ${selectedPayment === 'cash_on_delivery' ? 'payment-card--active' : ''}`}
                onClick={() => {
                  onChange('paymentMethod', 'cash_on_delivery')
                  onBlur?.('paymentMethod')
                }}
              >
                <div className="carrier-card-radio-circle">
                  {selectedPayment === 'cash_on_delivery' && <span className="radio-inner-dot" />}
                </div>
                <div className="payment-card-icon-box">
                  <CashIcon size={20} />
                </div>
                <div className="payment-card-info">
                  <strong className="payment-card-title">Оплата при отриманні</strong>
                  <span className="payment-card-desc">Готівкою або банківською карткою у відділенні при огляді</span>
                </div>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={selectedPayment === 'online'}
                className={`payment-card ${selectedPayment === 'online' ? 'payment-card--active' : ''}`}
                onClick={() => {
                  onChange('paymentMethod', 'online')
                  onBlur?.('paymentMethod')
                }}
              >
                <div className="carrier-card-radio-circle">
                  {selectedPayment === 'online' && <span className="radio-inner-dot" />}
                </div>
                <div className="payment-card-icon-box payment-card-icon--online">
                  <CreditCardIcon size={20} />
                </div>
                <div className="payment-card-info">
                  <strong className="payment-card-title">Онлайн-оплата (без комісії)</strong>
                  <span className="payment-card-desc">Миттєво через Visa, Mastercard, Apple Pay або Google Pay</span>
                </div>
              </button>
            </div>

            {errors.paymentMethod && (
              <p className="field-error" role="alert" style={{ marginTop: '0.5rem' }}>
                {errors.paymentMethod}
              </p>
            )}
          </div>
        </section>

        {/* БЛОК 4: Деталі замовлення та побажання */}
        <section className="checkout-card" aria-labelledby={`${idPrefix}-details-heading`}>
          <div className="checkout-card-header">
            <span className="checkout-step-badge">4</span>
            <div className="checkout-card-titles">
              <h3 id={`${idPrefix}-details-heading`} className="checkout-card-title">
                <MessageSquareIcon size={18} className="checkout-title-icon" />
                <span>Деталі замовлення та побажання</span>
              </h3>
              <p className="checkout-card-subtitle">Коментар до замовлення або додаткові послуги консультації</p>
            </div>
          </div>

          <div className="checkout-card-body">
            <FormField
              id={commentId}
              label="Коментар до замовлення (необов'язково)"
              hint="Вкажіть побажання: зручний час дзвінка, додаткове пакування або подарункову упаковку"
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
                placeholder="Напишіть ваші побажання тут..."
              />
            </FormField>

            <div className="checkout-options-row" style={{ marginTop: '1.25rem' }}>
              {/* Consultation checkbox card */}
              <label className="checkout-consultation-box">
                <input
                  id={consultationId}
                  name="needsConsultation"
                  type="checkbox"
                  checked={Boolean(draft.needsConsultation)}
                  onChange={(e) => onChange('needsConsultation', e.target.checked)}
                  onBlur={() => onBlur?.('needsConsultation')}
                  aria-invalid={Boolean(errors.needsConsultation)}
                  className="checkout-checkbox"
                />
                <div className="consultation-text-group">
                  <span className="consultation-title">Потрібна консультація щодо правил гри</span>
                  <span className="consultation-desc">
                    Менеджер зателефонує вам перед відправкою та відповість на запитання щодо правил гри та аксесуарів
                  </span>
                </div>
              </label>

              {errors.needsConsultation && (
                <p className="field-error" role="alert" style={{ marginTop: '0.35rem' }}>
                  {errors.needsConsultation}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Дії внизу форми */}
        <div className="checkout-form-actions">
          <AppButton type="submit" variant="primary" disabled={isSubmitting} className="checkout-submit-btn">
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