import Section from '../components/ui/Section.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import AvailabilityBadge from '../components/games/AvailabilityBadge.jsx'
import OrderFormPreview from '../components/orders/OrderFormPreview.jsx'

export default function OrderPage({ selectedGame }) {
  return (
    <Section id="order" title="Швидке замовлення / Бронювання">
      {selectedGame ? (
        <div className="order-preview-container">
          <div className="selected-game-summary">
            <p>
              Ви обрали гру: <strong>«{selectedGame.title}»</strong> ({selectedGame.price} ₴) —{' '}
              <AvailabilityBadge available={selectedGame.inStock} />
            </p>
          </div>
          <OrderFormPreview idPrefix="order-quick" gameTitle={selectedGame.title} />
        </div>
      ) : (
        <EmptyState title="Гру не обрано">
          Будь ласка, перейдіть до каталогу та оберіть гру для замовлення.
        </EmptyState>
      )}
    </Section>
  )
}