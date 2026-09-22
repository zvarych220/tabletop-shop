import HomePage from './HomePage.jsx'
import useBoardGameSelection from '../hooks/useBoardGameSelection.js'

export default function CatalogContainer({ items }) {
  const { selectedId, selectGame } = useBoardGameSelection()
  return (
    <HomePage
      items={items}
      selectedId={selectedId}
      onSelect={selectGame}
    />
  )
}