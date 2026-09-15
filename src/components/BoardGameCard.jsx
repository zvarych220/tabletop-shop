export default function BoardGameCard({ game }) {
  const statusText = game.inStock ? 'В наявності' : 'Очікується поставка'
  const statusClass = game.inStock ? 'status-available' : 'status-out'

  return (
    <article className="game-card">
      <div className="card-header">
        <span className="game-category">{game.category}</span>
        <span className={`game-status ${statusClass}`}>{statusText}</span>
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