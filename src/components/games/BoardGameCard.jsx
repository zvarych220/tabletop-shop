import AvailabilityBadge from './AvailabilityBadge.jsx'

export default function BoardGameCard({ game }) {
  return (
    <article className="game-card">
      <div className="card-header">
        <span className="game-category">{game.category}</span>
        <AvailabilityBadge available={game.inStock} />
      </div>

      <h3 className="game-title">{game.title}</h3>
      <p className="game-desc">{game.description}</p>

      <div className="game-specs">
        <span>👥 {game.players}</span>
        <span>⏱️ {game.playTime}</span>
      </div>

      <div className="card-footer">
        <span className="game-price">{game.price} ₴</span>
      </div>
    </article>
  )
}