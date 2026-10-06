export function validateOrder(input, items = []) {
  const errors = {}

  // 1. Покупець: Прізвище та ім'я
  const fullName = typeof input.fullName === 'string' ? input.fullName.trim() : ''
  if (!fullName) {
    errors.fullName = "Вкажіть прізвище та ім'я одержувача."
  } else if (fullName.length < 3) {
    errors.fullName = "Прізвище та ім'я мають містити щонайменше 3 символи."
  }

  // 2. Номер телефону
  const phone = typeof input.phone === 'string' ? input.phone.trim() : ''
  const digitsOnly = phone.replace(/\D/g, '')
  if (!phone) {
    errors.phone = 'Вкажіть контактний номер телефону.'
  } else if (digitsOnly.length < 10 || digitsOnly.length > 13) {
    errors.phone = 'Введіть коректний номер (наприклад, +380 50 123 45 67).'
  }

  // 3. Служба доставки (Тільки Нова Пошта або Укрпошта)
  const deliveryService = input.deliveryService
  if (deliveryService !== 'nova_poshta' && deliveryService !== 'ukr_poshta') {
    errors.deliveryService = 'Оберіть службу доставки: Нова Пошта або Укрпошта.'
  }

  // 4. Місто / Населений пункт
  const city = typeof input.city === 'string' ? input.city.trim() : ''
  if (!city) {
    errors.city = 'Вкажіть місто або населений пункт доставки.'
  } else if (city.length < 2) {
    errors.city = 'Назва міста має містити щонайменше 2 символи.'
  }

  // 5. Відділення / Поштомат
  const branch = typeof input.branch === 'string' ? input.branch.trim() : ''
  if (!branch) {
    errors.branch = 'Вкажіть номер відділення або поштомату.'
  }

  // 6. Товар(и)
  let orderedItems = Array.isArray(input.orderedItems) && input.orderedItems.length > 0
    ? input.orderedItems
    : []

  let primaryGameId = input.gameId
  if (!primaryGameId && orderedItems.length > 0) {
    primaryGameId = orderedItems[0].gameId
  }

  // Якщо передано gameId, але немає orderedItems, формуємо з каталогу
  if (primaryGameId && orderedItems.length === 0) {
    const foundGame = items.find((g) => g.id === primaryGameId)
    if (foundGame) {
      orderedItems = [
        {
          gameId: foundGame.id,
          title: foundGame.title,
          price: foundGame.price,
          quantity: Math.max(1, Number(input.quantity) || 1),
        },
      ]
    }
  }

  if (!primaryGameId && orderedItems.length === 0) {
    errors.items = 'Оберіть хоча б один товар для замовлення.'
  }

  const comment = typeof input.comment === 'string' ? input.comment.trim() : ''
  if (comment.length > 500) {
    errors.comment = 'Коментар не може перевищувати 500 символів.'
  }

  const paymentMethod = input.paymentMethod || 'cash_on_delivery'
  const totalPrice = orderedItems.reduce((acc, it) => acc + it.price * (it.quantity || 1), 0)

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    errors: {},
    value: {
      gameId: primaryGameId || (orderedItems[0]?.gameId ?? 'game-001'),
      fullName,
      phone,
      deliveryService,
      city,
      branch,
      paymentMethod,
      comment,
      orderedItems,
      totalPrice,
      durationHours: 1, // сумісність
      needsConsultation: false,
    },
  }
}
