import BoardGameCard from './BoardGameCard.jsx'
import EmptyState from '../ui/EmptyState.jsx'

export default function BoardGameList({ items }) {
  if (!items || items.length === 0) {
    return (
      <EmptyState title="Ігор не знайдено">
        Наразі в каталозі немає доступних ігор за обраними критеріями.
      </EmptyState>
    )
  }

  return (
    <div className="games-grid">
      {items.map((game) => (
        <BoardGameCard key={game.id} game={game} />
      ))}
    </div>
  )
}