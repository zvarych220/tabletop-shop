import { useState } from 'react'
import { BoardGameSelectionContext } from '../context/BoardGameSelectionContext.js'
import { useProducts } from '../hooks/useProducts.js'

export default function BoardGameSelectionProvider({ children }) {
  const { products } = useProducts()
  const [selectedId, setSelectedId] = useState(null)
  const selectedGame = products.find((item) => item.id === selectedId)

  function selectGame(id) {
    if (products.some((item) => item.id === id)) {
      setSelectedId(id)
    }
  }

  function clearSelection() {
    setSelectedId(null)
  }

  const value = {
    selectedId,
    selectedGame,
    selectGame,
    clearSelection,
  }

  return (
    <BoardGameSelectionContext.Provider value={value}>
      {children}
    </BoardGameSelectionContext.Provider>
  )
}