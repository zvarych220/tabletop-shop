import BoardGameListPage from './BoardGameListPage.jsx'
import useBoardGameSelection from '../hooks/useBoardGameSelection.js'

export default function CatalogContainer({ items }) {
  const { selectedId, selectGame } = useBoardGameSelection()
  return (
    <BoardGameListPage
      items={items}
      selectedId={selectedId}
      onSelect={selectGame}
    />
  )
}