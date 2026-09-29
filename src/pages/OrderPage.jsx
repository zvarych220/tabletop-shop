import { useState } from 'react'
import PageHeading from '../components/ui/PageHeading.jsx'
import Section from '../components/ui/Section.jsx'
import AppButton from '../components/ui/AppButton.jsx'
import AvailabilityBadge from '../components/games/AvailabilityBadge.jsx'
import OrderForm from '../components/orders/OrderForm.jsx'
import OrderSummary from '../components/orders/OrderSummary.jsx'
import { TargetIcon } from '../components/ui/Icons.jsx'
import { validateOrder } from '../domain/orderValidation.js'

const emptyDraft = { comment: '', durationHours: '1', needsConsultation: false }

export default function OrderPage({
  title,
  game,
  initialDraft = emptyDraft,
  onSave,
  onCancel,
  submitLabel = 'Зберегти замовлення',
  cancelLabel = 'Вийти без збереження',
}) {
  const initialValues = {
    comment: initialDraft.comment ?? '',
    durationHours: String(initialDraft.durationHours ?? '1'),
    needsConsultation: Boolean(initialDraft.needsConsultation),
  }

  const [draft, setDraft] = useState(() => ({ ...initialValues }))
  const [touched, setTouched] = useState({})
  const [attempted, setAttempted] = useState(false)
  const [operationError, setOperationError] = useState('')

  const validation = validateOrder({ ...draft, gameId: game.id }, [game])

  const errors = Object.fromEntries(
    Object.entries(validation.errors).filter(([field]) => attempted || touched[field]),
  )

  const isDirty =
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

  function handleSubmit(event) {
    event.preventDefault()
    setAttempted(true)
    setOperationError('')

    if (!validation.ok) {
      const firstField = ['comment', 'durationHours', 'needsConsultation'].find(
        (f) => validation.errors[f],
      )
      if (firstField) {
        event.currentTarget.elements.namedItem(firstField)?.focus()
      }
      return
    }

    const result = onSave(validation.value)
    if (!result.ok) {
      setOperationError(result.message || Object.values(result.errors || {}).join(' '))
    }
  }

  function handleReset() {
    if (!isDirty) return
    if (!window.confirm('Відкинути зміни та відновити початкові значення?')) return
    setDraft({ ...initialValues })
    setTouched({})
    setAttempted(false)
    setOperationError('')
  }

  function handleCancel() {
    if (isDirty && !window.confirm('Вийти та відкинути незбережені зміни?')) return
    onCancel()
  }

  return (
    <div className="order-page-wrapper">
      <Section id="order-form-section" title={title}>
        <PageHeading title={title} />
        <div className="order-page-layout">
          <div className="selected-game-banner">
            <div className="banner-game-info">
              <span className="banner-game-icon-wrap">
                <TargetIcon size={22} className="banner-icon-svg" />
              </span>
              <div className="banner-text-group">
                <span className="banner-subtitle">Товар у заявці:</span>
                <div className="banner-title-line">
                  <strong className="banner-game-title">«{game.title}»</strong>
                  <span className="banner-game-price">{game.price} ₴</span>
                  <AvailabilityBadge available={game.inStock} />
                </div>
              </div>
            </div>
            {onCancel && (
              <AppButton variant="secondary" onClick={handleCancel}>
                {cancelLabel}
              </AppButton>
            )}
          </div>

          <div className="order-split-grid">
            <div className="order-form-column">
              <OrderForm
                idPrefix="order-form"
                gameTitle={game.title}
                draft={draft}
                errors={errors}
                operationError={operationError}
                onChange={handleChange}
                onBlur={handleBlur}
                onSubmit={handleSubmit}
                onReset={handleReset}
                submitLabel={submitLabel}
              />
            </div>
            <div className="order-summary-column">
              <OrderSummary gameTitle={game.title} draft={draft} />
            </div>
          </div>
        </div>
      </Section>
    </div>
  )
}