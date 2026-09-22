import { useEffect, useState } from 'react'
import Section from '../components/ui/Section.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import AppButton from '../components/ui/AppButton.jsx'
import AvailabilityBadge from '../components/games/AvailabilityBadge.jsx'
import OrderForm from '../components/orders/OrderForm.jsx'
import OrderSummary from '../components/orders/OrderSummary.jsx'

function createInitialDraft() {
  return { comment: '', needsConsultation: false }
}

export default function OrderPage({ selectedGame, onClearSelection }) {
  const [draft, setDraft] = useState(createInitialDraft)

  // Синхронізація назви вкладки браузера із зовнішнім середовищем
  const pageTitle = selectedGame ? `Dice & Deck: ${selectedGame.title}` : 'Dice & Deck'
  useEffect(() => {
    const previousTitle = document.title
    document.title = pageTitle
    return () => {
      document.title = previousTitle
    }
  }, [pageTitle])

  function handleCommentChange(comment) {
    setDraft((prev) => ({ ...prev, comment }))
  }

  function handleConsultationChange(needsConsultation) {
    setDraft((prev) => ({ ...prev, needsConsultation }))
  }

  function handleResetDraft() {
    setDraft(createInitialDraft())
  }

  if (!selectedGame) {
    return (
      <Section id="order" title="Швидке замовлення / Бронювання">
        <EmptyState title="Гру не обрано">
          Будь ласка, перейдіть до каталогу вище та оберіть настільну гру, яку бажаєте замовити.
        </EmptyState>
      </Section>
    )
  }

  return (
    <Section id="order" title="Швидке замовлення / Бронювання">
      <div className="order-page-layout">
        <div className="selected-game-banner">
          <p>
            Ви обрали гру: <strong>«{selectedGame.title}»</strong> ({selectedGame.price} ₴) —{' '}
            <AvailabilityBadge available={selectedGame.inStock} />
          </p>
          <AppButton variant="secondary" onClick={onClearSelection}>
            Скасувати вибір гри
          </AppButton>
        </div>

        <div className="order-split-grid">
          <OrderForm
            idPrefix="order-main"
            gameTitle={selectedGame.title}
            draft={draft}
            onCommentChange={handleCommentChange}
            onNeedsConsultationChange={handleConsultationChange}
            onReset={handleResetDraft}
          />
          <OrderSummary gameTitle={selectedGame.title} draft={draft} />
        </div>
      </div>
    </Section>
  )
}