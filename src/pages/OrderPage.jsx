import { useEffect, useRef, useState } from 'react'
import PageHeading from '../components/ui/PageHeading.jsx'
import Section from '../components/ui/Section.jsx'
import AppButton from '../components/ui/AppButton.jsx'
import AvailabilityBadge from '../components/games/AvailabilityBadge.jsx'
import OrderForm from '../components/orders/OrderForm.jsx'
import OrderSummary from '../components/orders/OrderSummary.jsx'
import { TargetIcon } from '../components/ui/Icons.jsx'
import { validateOrder } from '../domain/orderValidation.js'

const emptyDraft = {
  fullName: '',
  phone: '',
  deliveryService: 'nova_poshta',
  city: '',
  branch: '',
  paymentMethod: 'cash_on_delivery',
  comment: '',
}

export default function OrderPage({
  title,
  game,
  orderedItems = [],
  initialDraft = emptyDraft,
  onSave,
  onCancel,
  submitLabel = 'Підтвердити покупку',
  cancelLabel = 'Повернутися до магазину',
}) {
  const effectiveItems = orderedItems.length > 0
    ? orderedItems
    : game
    ? [{ gameId: game.id, title: game.title, price: game.price, quantity: 1 }]
    : []

  const initialValues = {
    fullName: initialDraft.fullName ?? '',
    phone: initialDraft.phone ?? '',
    deliveryService: initialDraft.deliveryService ?? 'nova_poshta',
    city: initialDraft.city ?? '',
    branch: initialDraft.branch ?? '',
    paymentMethod: initialDraft.paymentMethod ?? 'cash_on_delivery',
    comment: initialDraft.comment ?? '',
  }

  const [draft, setDraft] = useState(() => ({ ...initialValues }))
  const [touched, setTouched] = useState({})
  const [attempted, setAttempted] = useState(false)
  const [operationError, setOperationError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submitting = useRef(false)
  const alive = useRef(false)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  const primaryGameId = game?.id || effectiveItems[0]?.gameId || 'game-001'
  const validation = validateOrder(
    { ...draft, gameId: primaryGameId, orderedItems: effectiveItems },
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
    draft.comment !== initialValues.comment

  function handleChange(field, value) {
    setDraft((prev) => ({ ...prev, [field]: value }))
    setOperationError('')
  }

  function handleBlur(field) {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (submitting.current) return

    setAttempted(true)
    setOperationError('')

    if (!validation.ok) {
      const firstField = ['fullName', 'phone', 'deliveryService', 'city', 'branch'].find(
        (f) => validation.errors[f],
      )
      if (firstField) {
        event.currentTarget.elements.namedItem(firstField)?.focus()
      }
      return
    }

    submitting.current = true
    setIsSubmitting(true)

    try {
      const result = await onSave(validation.value)
      if (!result.ok && alive.current) {
        setOperationError(
          result.errors
            ? Object.values(result.errors).join(' ')
            : result.message || 'Не вдалося зберегти замовлення.',
        )
      }
    } catch {
      if (alive.current) setOperationError('Не вдалося завершити оформлення замовлення.')
    } finally {
      submitting.current = false
      if (alive.current) setIsSubmitting(false)
    }
  }

  function handleReset() {
    if (submitting.current || !isDirty) return
    if (!window.confirm('Очистити внесені контактні дані та адресу?')) return
    setDraft({ ...initialValues })
    setTouched({})
    setAttempted(false)
    setOperationError('')
  }

  function handleCancel() {
    if (submitting.current) return
    if (isDirty && !window.confirm('Вийти та скасувати заповнення форми?')) return
    onCancel()
  }

  return (
    <div className="order-page-wrapper">
      <Section id="order-form-section" title={title}>
        <PageHeading title={title} />

        <div className="order-page-layout">
          {/* Banner */}
          <div className="selected-game-banner">
            <div className="banner-game-info">
              <span className="banner-game-icon-wrap">
                <TargetIcon size={22} className="banner-icon-svg" />
              </span>
              <div className="banner-text-group">
                <span className="banner-subtitle">
                  {effectiveItems.length > 1 ? 'Товари в замовленні:' : 'Товар до покупки:'}
                </span>
                <div className="banner-title-line">
                  {effectiveItems.length > 1 ? (
                    <strong className="banner-game-title">
                      {effectiveItems.length} настільних ігор у кошику
                    </strong>
                  ) : game ? (
                    <>
                      <strong className="banner-game-title">«{game.title}»</strong>
                      <span className="banner-game-price">{game.price} ₴</span>
                      <AvailabilityBadge available={game.inStock} />
                    </>
                  ) : (
                    <strong className="banner-game-title">Товар із кошика</strong>
                  )}
                </div>
              </div>
            </div>
            {onCancel && (
              <AppButton variant="secondary" onClick={handleCancel} disabled={isSubmitting}>
                {cancelLabel}
              </AppButton>
            )}
          </div>

          <div className="order-split-grid">
            <div className="order-form-column">
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
            <div className="order-summary-column">
              <OrderSummary draft={draft} orderedItems={effectiveItems} />
            </div>
          </div>
        </div>
      </Section>
    </div>
  )
}