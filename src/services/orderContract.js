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
    value.id.length > 0

  if (!valid) {
    throw new ServiceError('Джерело повернуло некоректний запис замовлення.', {
      code: 'BAD_DATA',
    })
  }

  const orderedItems = Array.isArray(value.orderedItems) && value.orderedItems.length > 0
    ? value.orderedItems
    : value.gameId
    ? [{ gameId: value.gameId, title: 'Настільна гра', price: Number(value.totalPrice) || 2150, quantity: 1 }]
    : []

  const primaryGameId = value.gameId || (orderedItems[0]?.gameId ?? 'game-001')
  const totalPrice = Number(value.totalPrice) || orderedItems.reduce((acc, it) => acc + (it.price || 0) * (it.quantity || 1), 0)

  return {
    id: value.id,
    gameId: primaryGameId,
    fullName: typeof value.fullName === 'string' ? value.fullName : 'Покупець',
    phone: typeof value.phone === 'string' ? value.phone : '+380501234567',
    deliveryService: value.deliveryService === 'ukr_poshta' ? 'ukr_poshta' : 'nova_poshta',
    city: typeof value.city === 'string' ? value.city : 'Київ',
    branch: typeof value.branch === 'string' ? value.branch : 'Відділення №1',
    paymentMethod: value.paymentMethod || 'cash_on_delivery',
    comment: typeof value.comment === 'string' ? value.comment : '',
    orderedItems,
    totalPrice,
    durationHours: 1,
    needsConsultation: false,
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
