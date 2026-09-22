import BoardGameCard from './BoardGameCard.jsx'
import EmptyState from '../ui/EmptyState.jsx'

export default function BoardGameList({
  items,
  selectedId,
  onSelect,
  emptyTitle = 'Ігор не знайдено',
}) {
  if (!items || items.length === 0) {
    return (
      <EmptyState title={emptyTitle}>
        За вказаними критеріями пошуку наразі нічого немає.
      </EmptyState>
    )
  }

  return (
    <div className="games-grid">
      {items.map((game) => (
        <BoardGameCard
          key={game.id}
          game={game}
          selected={game.id === selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}