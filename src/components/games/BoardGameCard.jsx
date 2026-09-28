import { useState } from 'react'
import { Link } from 'react-router'
import AvailabilityBadge from './AvailabilityBadge.jsx'
import AppButton from '../ui/AppButton.jsx'
import {
  SwordsIcon,
  PartyIcon,
  CompassIcon,
  FeatherIcon,
  DiceIcon,
  CheckIcon,
  UsersIcon,
  ClockIcon,
} from '../ui/Icons.jsx'

function renderCategoryIcon(category) {
  switch (category) {
    case 'Стратегія':
      return <SwordsIcon size={32} className="art-icon-svg" />
    case 'Паті-гра':
      return <PartyIcon size={32} className="art-icon-svg" />
    case 'Кооперативна':
      return <CompassIcon size={32} className="art-icon-svg" />
    case 'Сімейна':
      return <FeatherIcon size={32} className="art-icon-svg" />
    default:
      return <DiceIcon size={32} className="art-icon-svg" />
  }
}

export default function BoardGameCard({ game, selected, onSelect }) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const descriptionId = `game-${game.id}-description`

  return (
    <article className={`game-card ${selected ? 'game-card-selected' : ''}`}>
      <div className={`card-art-banner card-art-${game.id}`}>
        <div className="card-art-pattern" aria-hidden="true"></div>
        <div className="card-art-icon" aria-hidden="true">
          {renderCategoryIcon(game.category)}
        </div>
        {selected && (
          <span className="card-selected-pill">
            <CheckIcon size={12} className="card-check-svg" />
            <span>Обрано</span>
          </span>
        )}
      </div>

      <div className="card-body">
        <div className="card-header">
          <span className="game-category">{game.category}</span>
          <AvailabilityBadge available={game.inStock} />
        </div>

        <h3 className="game-title">
          <Link to={`/games/${game.id}`} className="card-title-link">
            {game.title}
          </Link>
        </h3>

        <div className="card-actions-inline">
          <AppButton
            variant="secondary"
            aria-expanded={detailsOpen}
            aria-controls={descriptionId}
            onClick={() => setDetailsOpen((prev) => !prev)}
          >
            {detailsOpen ? 'Згорнути опис' : 'Швидкий перегляд'}
          </AppButton>

          <AppButton
            variant={selected ? 'secondary' : 'primary'}
            aria-pressed={selected}
            onClick={() => onSelect(game.id)}
          >
            {selected ? 'Обрано' : 'Обрати'}
          </AppButton>
        </div>

        {detailsOpen && (
          <p id={descriptionId} className="game-desc">
            {game.description}
          </p>
        )}

        <div className="game-specs">
          <span className="spec-tag">
            <UsersIcon size={14} className="spec-icon-svg" />
            <span>{game.players}</span>
          </span>
          <span className="spec-tag">
            <ClockIcon size={14} className="spec-icon-svg" />
            <span>{game.playTime}</span>
          </span>
        </div>

        <div className="card-footer">
          <div className="game-price-wrapper">
            <span className="price-label">Ціна</span>
            <span className="game-price">{game.price} ₴</span>
          </div>
          <Link to={`/games/${game.id}`} className="details-link">
            <span>Детальніше</span>
            <span className="link-arrow">→</span>
          </Link>
        </div>
      </div>
    </article>
  )
}