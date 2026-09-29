export function validateOrder(input, items) {
  const errors = {}
  const comment = typeof input.comment === 'string' ? input.comment.trim() : ''
  const hoursText = String(input.durationHours ?? '').trim()
  const durationHours = Number(hoursText)

  if (!items.some((item) => item.id === input.gameId)) {
    errors.gameId = 'Оберіть наявну гру з каталогу.'
  }

  if (comment.length === 0) {
    errors.comment = 'Вкажіть коментар до замовлення.'
  } else if (comment.length < 10 || comment.length > 500) {
    errors.comment = 'Коментар має містити від 10 до 500 символів без крайніх пробілів.'
  }

  if (hoursText === '') {
    errors.durationHours = 'Вкажіть тривалість партії/броні.'
  } else if (
    !Number.isInteger(durationHours) ||
    durationHours < 1 ||
    durationHours > 8
  ) {
    errors.durationHours = 'Тривалість має бути цілим числом від 1 до 8 годин.'
  }

  if (typeof input.needsConsultation !== 'boolean') {
    errors.needsConsultation = 'Ознака консультації має бути логічним значенням.'
  } else if (!errors.durationHours && durationHours > 4 && !input.needsConsultation) {
    errors.needsConsultation = 'Для тривалості понад 4 години консультація гейм-майстра обов’язкова.'
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    errors: {},
    value: {
      gameId: input.gameId,
      comment,
      durationHours,
      needsConsultation: input.needsConsultation,
    },
  }
}
