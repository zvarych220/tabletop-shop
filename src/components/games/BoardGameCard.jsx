import { useState } from 'react'
import AvailabilityBadge from './AvailabilityBadge.jsx'
import AppButton from '../ui/AppButton.jsx'

export default function BoardGameCard({ game, selected, onSelect }) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const descriptionId = `game-${game.id}-description`

  return (
    <article className={`game-card ${selected ? 'game-card-selected' : ''}`}>
      <div className="card-header">
        <span className="game-category">{game.category}</span>
        <AvailabilityBadge available={game.inStock} />
      </div>

      <h3 className="game-title">{game.title}</h3>

      <div className="card-actions-inline">
        <AppButton
          variant="secondary"
          aria-expanded={detailsOpen}
          aria-controls={descriptionId}
          onClick={() => setDetailsOpen((prev) => !prev)}
        >
          {detailsOpen ? 'Згорнути опис' : 'Показати опис'}
        </AppButton>

        <AppButton
          variant={selected ? 'secondary' : 'primary'}
          aria-pressed={selected}
          onClick={() => onSelect(game.id)}
        >
          {selected ? 'Обрано' : 'Обрати для замовлення'}
        </AppButton>
      </div>

      {detailsOpen && (
        <p id={descriptionId} className="game-desc">
          {game.description}
        </p>
      )}

      <div className="game-specs">
        <span>👥 {game.players}</span>
        <span>⏱️ {game.playTime}</span>
      </div>

      <div className="card-footer">
        <span className="game-price">{game.price} ₴</span>
        {selected && <span className="selection-badge">✓ У чернетці</span>}
      </div>
    </article>
  )
}