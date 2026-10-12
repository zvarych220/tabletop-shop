import { useEffect, useRef, useState } from 'react'
import PageHeading from '../components/ui/PageHeading.jsx'
import Section from '../components/ui/Section.jsx'
import AppButton from '../components/ui/AppButton.jsx'
import OrderForm from '../components/orders/OrderForm.jsx'
import { TargetIcon } from '../components/ui/Icons.jsx'
import { validateOrder } from '../domain/orderValidation.js'

const emptyDraft = {
  comment: '',
  durationHours: 2,
  needsConsultation: true,
}

export default function OrderPage({
  title = 'Створення замовлення',
  game,
  initialDraft = emptyDraft,
  onSave,
  onCancel,
  submitLabel = 'Створити заявку',
  cancelLabel = 'Скасувати',
}) {
  const initialValues = {
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

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  const validation = validateOrder(
    { ...draft, gameId: game?.id },
    game ? [game] : [],
  )

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
      const firstField = ['comment', 'durationHours', 'needsConsultation', 'gameId'].find(
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

  return (
    <div className="order-page-wrapper">
      <Section id="order-form-section" title={title}>
        <PageHeading title={title} />

        <div className="order-page-layout">
          {game && (
            <div className="selected-game-banner">
              <div className="banner-game-info">
                <span className="banner-game-icon-wrap">
                  <TargetIcon size={22} className="banner-icon-svg" />
                </span>
                <div className="banner-text-group">
                  <span className="banner-subtitle">Обрана настільна гра:</span>
                  <div className="banner-title-line">
                    <strong className="banner-game-title">«{game.title}»</strong>
                  </div>
                </div>
              </div>
              {onCancel && (
                <AppButton variant="secondary" onClick={handleCancel} disabled={isSubmitting}>
                  {cancelLabel}
                </AppButton>
              )}
            </div>
          )}

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
          </div>
        </div>
      </Section>
    </div>
  )
}