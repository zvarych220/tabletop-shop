import { useState } from 'react'
import { BoardGameSelectionContext } from '../context/BoardGameSelectionContext.js'

export default function BoardGameSelectionProvider({ items, children }) {
  const [selectedId, setSelectedId] = useState(null)
  const selectedGame = items.find((item) => item.id === selectedId)

  function selectGame(id) {
    if (items.some((item) => item.id === id)) {
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