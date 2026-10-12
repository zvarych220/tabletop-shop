export function validateOrder(input, items = []) {
  const errors = {}

  // 1. Перевірка гри у каталозі
  const gameFound = Array.isArray(items) && items.some((item) => item.id === input?.gameId)
  if (!gameFound) {
    errors.gameId = 'Оберіть гру з каталогу.'
  }

  // 2. Коментар
  const rawComment = typeof input?.comment === 'string' ? input.comment : ''
  const comment = rawComment.trim()
  if (!comment) {
    errors.comment = 'Вкажіть коментар до заявки.'
  }

  // 3. Тривалість (ціле число від 1 до 8)
  const rawDuration = input?.durationHours
  const durationStr =
    typeof rawDuration === 'number'
      ? String(rawDuration)
      : typeof rawDuration === 'string'
      ? rawDuration.trim()
      : ''
  const durationNum = Number(durationStr)
  const isInteger = durationStr !== '' && /^\d+$/.test(durationStr) && Number.isInteger(durationNum)

  if (!isInteger || durationNum < 1 || durationNum > 8) {
    errors.durationHours = 'Вкажіть тривалість від 1 до 8 годин.'
  }

  // 4. Консультація для тривалих сесій (> 4 год)
  const needsConsultation = Boolean(input?.needsConsultation)
  if (durationNum > 4 && !needsConsultation) {
    errors.needsConsultation = 'Для сесій понад 4 години потрібна попередня консультація.'
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors }
  }

  const value = {
    gameId: input.gameId,
    comment,
    durationHours: durationNum,
    needsConsultation,
  }

  if (input.fullName !== undefined) value.fullName = input.fullName
  if (input.phone !== undefined) value.phone = input.phone
  if (input.deliveryService !== undefined) value.deliveryService = input.deliveryService
  if (input.city !== undefined) value.city = input.city
  if (input.branch !== undefined) value.branch = input.branch
  if (input.paymentMethod !== undefined) value.paymentMethod = input.paymentMethod
  if (input.orderedItems !== undefined) value.orderedItems = input.orderedItems
  if (input.totalPrice !== undefined) value.totalPrice = input.totalPrice

  return {
    ok: true,
    errors: {},
    value,
  }
}
