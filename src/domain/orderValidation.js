export function validateOrder(input, items = []) {
  const errors = {}

  // 1. Перевірка гри у каталозі
  const gameFound = Array.isArray(items) && items.some((item) => item.id === input?.gameId)
  if (!gameFound && !input?.orderedItems?.length) {
    errors.gameId = 'Оберіть гру з каталогу.'
  }

  // 2. ПІБ отримувача
  const rawFullName = typeof input?.fullName === 'string' ? input.fullName : ''
  const fullName = rawFullName.trim()
  if (!fullName) {
    errors.fullName = 'Вкажіть ПІБ отримувача.'
  } else if (fullName.length < 2) {
    errors.fullName = 'ПІБ має містити щонайменше 2 символи.'
  }

  // 3. Телефон
  const rawPhone = typeof input?.phone === 'string' ? input.phone : ''
  const phone = rawPhone.trim()
  if (!phone) {
    errors.phone = 'Вкажіть номер телефону.'
  } else if (!/^\+?[\d\s\-()]{10,}$/.test(phone)) {
    errors.phone = 'Введіть коректний номер телефону.'
  }

  // 4. Служба доставки
  const deliveryService = input?.deliveryService
  if (!deliveryService || !['nova_poshta', 'ukr_poshta'].includes(deliveryService)) {
    errors.deliveryService = 'Оберіть службу доставки.'
  }

  // 5. Місто
  const rawCity = typeof input?.city === 'string' ? input.city : ''
  const city = rawCity.trim()
  if (!city) {
    errors.city = 'Вкажіть місто доставки.'
  }

  // 6. Відділення
  const rawBranch = typeof input?.branch === 'string' ? input.branch : ''
  const branch = rawBranch.trim()
  if (!branch) {
    errors.branch = 'Вкажіть номер або адресу відділення.'
  }

  // 7. Спосіб оплати
  const paymentMethod = input?.paymentMethod
  if (!paymentMethod || !['cash_on_delivery', 'online'].includes(paymentMethod)) {
    errors.paymentMethod = 'Оберіть спосіб оплати.'
  }

  // 8. Коментар (необов'язковий)
  const rawComment = typeof input?.comment === 'string' ? input.comment : ''
  const comment = rawComment.trim()

  // 9. Тривалість (ціле число від 1 до 8)
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

  // 10. Консультація для тривалих сесій (> 4 год)
  const needsConsultation = Boolean(input?.needsConsultation)
  if (durationNum > 4 && !needsConsultation) {
    errors.needsConsultation = 'Для сесій понад 4 години потрібна попередня консультація.'
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors }
  }

  const value = {
    gameId: input.gameId,
    fullName,
    phone,
    deliveryService,
    city,
    branch,
    paymentMethod,
    comment,
    durationHours: durationNum,
    needsConsultation,
  }

  if (input.orderedItems !== undefined) value.orderedItems = input.orderedItems
  if (input.totalPrice !== undefined) value.totalPrice = input.totalPrice
  if (input.userId !== undefined) value.userId = input.userId
  if (input.status !== undefined) value.status = input.status
  if (input.createdAt !== undefined) value.createdAt = input.createdAt

  return {
    ok: true,
    errors: {},
    value,
  }
}
