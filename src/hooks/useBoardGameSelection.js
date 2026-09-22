import { useContext } from 'react'
import { BoardGameSelectionContext } from '../context/BoardGameSelectionContext.js'

export default function useBoardGameSelection() {
  const context = useContext(BoardGameSelectionContext)
  if (context === null) {
    throw new Error('useBoardGameSelection must be used within BoardGameSelectionProvider')
  }
  return context
}