import { useEffect, useRef, useState } from 'react'
import OrderForm from '../components/orders/OrderForm.jsx'
import {
  CartIcon,
  PackageIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  TruckIcon,
  ZapIcon,
} from '../components/ui/Icons.jsx'
import { validateOrder } from '../domain/orderValidation.js'
import useAuth from '../hooks/useAuth.js'

const emptyDraft = {
  fullName: '',
  phone: '',
  telegramChatId: '',
  deliveryService: 'nova_poshta',
  city: '',
  branch: '',
  paymentMethod: 'cash_on_delivery',
  comment: '',
  durationHours: 2,
  needsConsultation: true,
}

export default function OrderPage({
  title = 'Оформлення замовлення',
  game,
  cartItems,
  totalPrice,
  initialDraft = emptyDraft,
  onSave,
  onCancel,
  submitLabel = 'Оформити замовлення',
  cancelLabel = 'Скасувати',
}) {
  const { user } = useAuth()

  const initialValues = {
    fullName: initialDraft.fullName || user?.name || '',
    phone: initialDraft.phone || user?.phone || '',
    telegramChatId: initialDraft.telegramChatId || user?.telegramChatId || '',
    deliveryService: initialDraft.deliveryService ?? 'nova_poshta',
    city: initialDraft.city ?? '',
    branch: initialDraft.branch ?? '',
    paymentMethod: initialDraft.paymentMethod ?? 'cash_on_delivery',
    comment: initialDraft.comment ?? '',
    durationHours: initialDraft.durationHours ?? 2,
    needsConsultation: initialDraft.needsConsultation ?? true,
  }

  const [draft, setDraft] = useState(() => ({ ...initialValues }))
  const [touched, setTouched] = useState({})
  const [attempted, setAttempted] = useState(false)
  const [operationError, setOperationError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submitting = useRef(false)
  const alive = useRef(false)
  const formRef = useRef(null)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  const validation = validateOrder(
    { ...draft, gameId: game?.id, orderedItems: cartItems },
    game ? [game] : [],
  )

  const errors = Object.fromEntries(
    Object.entries(validation.errors).filter(([field]) => attempted || touched[field]),
  )

  const isDirty =
    draft.fullName !== initialValues.fullName ||
    draft.phone !== initialValues.phone ||
    draft.deliveryService !== initialValues.deliveryService ||
    draft.city !== initialValues.city ||
    draft.branch !== initialValues.branch ||
    draft.paymentMethod !== initialValues.paymentMethod ||
    draft.comment !== initialValues.comment ||
    draft.durationHours !== initialValues.durationHours ||
    draft.needsConsultation !== initialValues.needsConsultation

  function handleChange(field, value) {
    setDraft((prev) => ({ ...prev, [field]: value }))
    setOperationError('')
  }

  function handleBlur(field) {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  async function handleSubmit(event) {
    if (event?.preventDefault) {
      event.preventDefault()
    }
    if (submitting.current) return

    setAttempted(true)
    setOperationError('')

    if (!validation.ok) {
      const firstField = [
        'fullName',
        'phone',
        'deliveryService',
        'city',
        'branch',
        'paymentMethod',
        'comment',
        'durationHours',
        'needsConsultation',
        'gameId',
      ].find((f) => validation.errors[f])

      if (firstField && formRef.current) {
        formRef.current.elements?.namedItem?.(firstField)?.focus()
      }
      return
    }

    submitting.current = true
    setIsSubmitting(true)

    try {
      const result = await onSave(validation.value)
      if (result && !result.ok && alive.current) {
        setOperationError(
          result.errors
            ? Object.values(result.errors).join(' ')
            : result.message || 'Не вдалося зберегти заявку.',
        )
      }
    } catch {
      if (alive.current) setOperationError('Не вдалося завершити збереження заявки.')
    } finally {
      submitting.current = false
      if (alive.current) setIsSubmitting(false)
    }
  }

  function handleReset() {
    if (submitting.current || !isDirty) return
    setDraft({ ...initialValues })
    setTouched({})
    setAttempted(false)
    setOperationError('')
  }

  function handleCancel() {
    if (submitting.current) return
    onCancel?.()
  }

  const itemsCount = cartItems?.length || (game ? 1 : 0)
  const finalPrice = totalPrice ?? (game ? game.price : 0)
  const isFreeDelivery = finalPrice >= 1500

  return (
    <div className="order-page-wrapper">
      {/* Чистий сучасний заголовок сторінки без дублювання */}
      <header className="checkout-page-header">
        <div className="checkout-badge-pill">
          <PackageIcon size={15} />
          <span>Оформлення замовлення</span>
        </div>
        <h1 className="checkout-page-title">{title}</h1>
        <p className="checkout-page-subtitle">
          Заповніть контактні дані та адресу доставки для отримання ваших улюблених настілок
        </p>
      </header>

      {/* Головна 2-колонкова сітка: Ліворуч форма блоками, праворуч стікі підсумок чеку */}
      <div className="checkout-split-grid">
        {/* ЛІВА КОЛОНКА: Покрокова форма оформлення */}
        <div className="checkout-form-column" ref={formRef}>
          <OrderForm
            idPrefix="order-form"
            draft={draft}
            errors={errors}
            operationError={operationError}
            isSubmitting={isSubmitting}
            onChange={handleChange}
            onBlur={handleBlur}
            onSubmit={handleSubmit}
            onReset={handleReset}
            submitLabel={submitLabel}
          />
        </div>

        {/* ПРАВА КОЛОНКА: Стікі підсумок замовлення з товарами */}
        <aside className="checkout-sidebar-column">
          <div className="checkout-summary-card">
            <div className="checkout-summary-header">
              <div className="checkout-summary-heading-wrap">
                <CartIcon size={20} className="checkout-summary-cart-icon" />
                <h3 className="checkout-summary-title">Ваше замовлення</h3>
              </div>
              <span className="checkout-items-counter-badge">
                {itemsCount} {itemsCount === 1 ? 'товар' : itemsCount < 5 ? 'товари' : 'товарів'}
              </span>
            </div>

            {/* Список товарів */}
            <div className="checkout-summary-items-list">
              {cartItems && cartItems.length > 0 ? (
                cartItems.map((item, index) => (
                  <div key={item.gameId || index} className="checkout-summary-item-row">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="checkout-summary-item-img"
                      />
                    )}
                    <div className="checkout-summary-item-info">
                      <strong className="checkout-summary-item-title">{item.title}</strong>
                      <span className="checkout-summary-item-sub">
                        {item.price} ₴ × {item.quantity}
                      </span>
                    </div>
                    <span className="checkout-summary-item-price">
                      {item.price * item.quantity} ₴
                    </span>
                  </div>
                ))
              ) : game ? (
                <div className="checkout-summary-item-row">
                  {game.image && (
                    <img
                      src={game.image}
                      alt={game.title}
                      className="checkout-summary-item-img"
                    />
                  )}
                  <div className="checkout-summary-item-info">
                    <strong className="checkout-summary-item-title">{game.title}</strong>
                    <span className="checkout-summary-item-sub">{game.price} ₴ × 1</span>
                  </div>
                  <span className="checkout-summary-item-price">{game.price} ₴</span>
                </div>
              ) : null}
            </div>

            {/* Доставка: безкоштовна або плашка прогресу */}
            <div className="checkout-delivery-perk-banner">
              {isFreeDelivery ? (
                <div className="perk-banner perk-banner--free">
                  <CheckCircleIcon size={16} className="perk-banner-icon" />
                  <span>Безкоштовна доставка активна!</span>
                </div>
              ) : (
                <div className="perk-banner perk-banner--info">
                  <ZapIcon size={16} className="perk-banner-icon" />
                  <span>Додайте товарів ще на {1500 - finalPrice} ₴ для безкоштовної доставки</span>
                </div>
              )}
            </div>

            {/* Розрахунок вартості */}
            <div className="checkout-summary-calculation">
              <div className="calc-row">
                <span className="calc-label">Сума замовлення</span>
                <span className="calc-value">{finalPrice} ₴</span>
              </div>
              <div className="calc-row">
                <span className="calc-label">Доставка</span>
                <span className="calc-value calc-value--accent">
                  {isFreeDelivery ? 'Безкоштовно' : 'За тарифами перевізника'}
                </span>
              </div>
              <div className="calc-divider" />
              <div className="calc-row calc-row--total">
                <span className="calc-total-label">Загальна сума</span>
                <strong className="calc-total-value">{finalPrice} ₴</strong>
              </div>
            </div>

            {/* Кнопка швидкого підтвердження у сайдбарі */}
            <div className="checkout-sidebar-actions">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="checkout-sidebar-submit-btn"
              >
                <span>{isSubmitting ? 'Збереження…' : submitLabel}</span>
                <span aria-hidden="true">→</span>
              </button>

              {onCancel && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="checkout-sidebar-cancel-btn"
                >
                  {cancelLabel}
                </button>
              )}
            </div>

            {/* Блок довіри та переваг */}
            <div className="checkout-trust-perks">
              <div className="trust-perk-item">
                <TruckIcon size={16} className="trust-icon" />
                <span>Швидка відправка в день замовлення</span>
              </div>
              <div className="trust-perk-item">
                <ShieldCheckIcon size={16} className="trust-icon" />
                <span>100% оригінальні ліцензійні настілки</span>
              </div>
              <div className="trust-perk-item">
                <PackageIcon size={16} className="trust-icon" />
                <span>Надійне захисне пакування кожної коробки</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}