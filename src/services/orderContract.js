import { boardGames } from '../data/boardGames.js'
import { validateOrder } from '../domain/orderValidation.js'
import { ServiceError } from './ServiceError.js'

export function toOrderInput(input) {
  const result = validateOrder(input, boardGames)
  if (!result.ok) {
    throw new ServiceError('Перевірте поля заявки.', {
      code: 'VALIDATION',
      errors: result.errors,
    })
  }
  return result.value
}

export function toOrder(value) {
  const valid =
    value !== null &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    value.id.length > 0 &&
    typeof value.gameId === 'string' &&
    typeof value.comment === 'string' &&
    Number.isInteger(value.durationHours) &&
    typeof value.needsConsultation === 'boolean'

  if (!valid) {
    throw new ServiceError('Джерело повернуло некоректний запис замовлення.', {
      code: 'BAD_DATA',
    })
  }

  return {
    id: value.id,
    gameId: value.gameId,
    comment: value.comment,
    durationHours: value.durationHours,
    needsConsultation: value.needsConsultation,
  }
}

export function toOrderList(value) {
  if (!Array.isArray(value)) {
    throw new ServiceError('Джерело повернуло некоректний список.', {
      code: 'BAD_DATA',
    })
  }
  const records = value.map(toOrder)
  if (new Set(records.map((r) => r.id)).size !== records.length) {
    throw new ServiceError('Джерело повернуло повторні ідентифікатори.', {
      code: 'BAD_DATA',
    })
  }
  return records
}
