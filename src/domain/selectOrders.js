export function selectOrders(orders, items, { query, consultation, sort }) {
  const names = new Map((items || []).map((item) => [String(item.id), item.title]))
  const normalizedQuery = query.trim().toLocaleLowerCase('uk')

  function getTitle(order) {
    if (order.orderedItems && order.orderedItems.length > 0) {
      return order.orderedItems.map((item) => item.title).join(' ')
    }
    return names.get(String(order.gameId)) ?? order.gameId ?? ''
  }

  const selected = orders.filter((order) => {
    const text = `${getTitle(order)} ${order.comment || ''}`.toLocaleLowerCase('uk')
    const matchesConsultation =
      consultation === 'all' ||
      (consultation === 'yes' ? order.needsConsultation : !order.needsConsultation)
    return text.includes(normalizedQuery) && matchesConsultation
  })

  return selected.sort((a, b) => {
    let order
    if (sort === 'duration-asc') order = a.durationHours - b.durationHours
    else if (sort === 'duration-desc') order = b.durationHours - a.durationHours
    else {
      order = getTitle(a).localeCompare(getTitle(b), 'uk')
    }
    return order || String(a.id).localeCompare(String(b.id))
  })
}
