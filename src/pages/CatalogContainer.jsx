import BoardGameListPage from './BoardGameListPage.jsx'
import useBoardGameSelection from '../hooks/useBoardGameSelection.js'

export default function CatalogContainer() {
  const { selectedId, selectGame } = useBoardGameSelection()
  return (
    <BoardGameListPage
      selectedId={selectedId}
      onSelect={selectGame}
    />
  )
}