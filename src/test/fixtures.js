import { boardGames } from '../data/boardGames.js'

export const testGame = boardGames.find((item) => item.id === 'game-001')

export const validInput = {
  gameId: 'game-001',
  comment: 'Складання колоди та вивчення правил перед турніром.',
  durationHours: 2,
  needsConsultation: true,
}

export const savedOrder = {
  ...validInput,
  id: 'ord-test-001',
}
