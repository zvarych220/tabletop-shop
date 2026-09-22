import OrderPage from './OrderPage.jsx'
import useBoardGameSelection from '../hooks/useBoardGameSelection.js'

export default function OrderContainer() {
  const { selectedId, selectedGame, clearSelection } = useBoardGameSelection()
  return (
    <OrderPage
      key={selectedId ?? 'empty'}
      selectedGame={selectedGame}
      onClearSelection={clearSelection}
    />
  )
}