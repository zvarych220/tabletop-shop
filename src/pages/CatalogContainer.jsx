import BoardGameListPage from './BoardGameListPage.jsx'
import useBoardGameSelection from '../hooks/useBoardGameSelection.js'
import { useProducts } from '../hooks/useProducts.js'

export default function CatalogContainer() {
  const { products } = useProducts()
  const { selectedId, selectGame } = useBoardGameSelection()
  return (
    <BoardGameListPage
      items={products}
      selectedId={selectedId}
      onSelect={selectGame}
    />
  )
}