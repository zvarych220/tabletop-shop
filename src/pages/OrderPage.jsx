import { useEffect, useRef, useState } from 'react'
import PageHeading from '../components/ui/PageHeading.jsx'
import Section from '../components/ui/Section.jsx'
import AppButton from '../components/ui/AppButton.jsx'
import AvailabilityBadge from '../components/games/AvailabilityBadge.jsx'
import OrderForm from '../components/orders/OrderForm.jsx'
import OrderSummary from '../components/orders/OrderSummary.jsx'
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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submitting = useRef(false)
  const alive = useRef(false)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

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

  async function handleSubmit(event) {
    event.preventDefault()
    if (submitting.current) return

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

    submitting.current = true
    setIsSubmitting(true)

    try {
      const result = await onSave(validation.value)
      if (!result.ok && alive.current) {
        setOperationError(
          result.errors
            ? Object.values(result.errors).join(' ')
            : result.message || 'Не вдалося зберегти заявку.',
        )
      }
    } catch {
      if (alive.current) setOperationError('Не вдалося завершити операцію збереження.')
    } finally {
      submitting.current = false
      if (alive.current) setIsSubmitting(false)
    }
  }

  function handleReset() {
    if (submitting.current || !isDirty) return
    if (!window.confirm('Відкинути зміни та відновити початкові значення?')) return
    setDraft({ ...initialValues })
    setTouched({})
    setAttempted(false)
    setOperationError('')
  }

  function handleCancel() {
    if (submitting.current) return
    if (isDirty && !window.confirm('Вийти та відкинути незбережені зміни?')) return
    onCancel()
  }

  return (
    <Section id="order-form-section" title={title}>
      <PageHeading title={title} />
      <div className="order-page-layout">
        <div className="selected-game-banner">
          <p>
            Обрана гра: <strong>«{game.title}»</strong> ({game.price} ₴) —{' '}
            <AvailabilityBadge available={game.inStock} />
          </p>
          <AppButton variant="secondary" onClick={handleCancel} disabled={isSubmitting}>
            {cancelLabel}
          </AppButton>
        </div>

        <div className="order-split-grid">
          <OrderForm
            idPrefix="order-form"
            gameTitle={game.title}
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
          <OrderSummary gameTitle={game.title} draft={draft} />
        </div>
      </div>
    </Section>
  )
}