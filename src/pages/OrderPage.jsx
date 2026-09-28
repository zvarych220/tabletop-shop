import { useState } from 'react'
import PageHeading from '../components/ui/PageHeading.jsx'
import Section from '../components/ui/Section.jsx'
import AppButton from '../components/ui/AppButton.jsx'
import AvailabilityBadge from '../components/games/AvailabilityBadge.jsx'
import OrderForm from '../components/orders/OrderForm.jsx'
import OrderSummary from '../components/orders/OrderSummary.jsx'
import { TargetIcon } from '../components/ui/Icons.jsx'

const defaultDraft = { comment: '', needsConsultation: false }

export default function OrderPage({
  title,
  game,
  initialDraft = defaultDraft,
  onCancel,
  cancelLabel = 'Скасувати та повернутися',
}) {
  const [draft, setDraft] = useState(() => ({ ...initialDraft }))

  function handleCommentChange(comment) {
    setDraft((prev) => ({ ...prev, comment }))
  }

  function handleConsultationChange(needsConsultation) {
    setDraft((prev) => ({ ...prev, needsConsultation }))
  }

  function handleReset() {
    setDraft({ ...defaultDraft })
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
              <AppButton variant="secondary" onClick={onCancel}>
                {cancelLabel}
              </AppButton>
            )}
          </div>


          <div className="order-split-grid">
            <div className="order-form-column">
              <OrderForm
                idPrefix="order-edit"
                gameTitle={game.title}
                draft={draft}
                onCommentChange={handleCommentChange}
                onNeedsConsultationChange={handleConsultationChange}
                onReset={handleReset}
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