export function selectOrders(orders, items, { query, consultation, sort }) {
  const names = new Map(items.map((item) => [item.id, item.title]))
  const normalizedQuery = query.trim().toLocaleLowerCase('uk')

  const selected = orders.filter((order) => {
    const text = `${names.get(order.gameId) ?? ''} ${order.comment}`.toLocaleLowerCase('uk')
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
      order = (names.get(a.gameId) ?? '').localeCompare(names.get(b.gameId) ?? '', 'uk')
    }
    return order || a.id.localeCompare(b.id)
  })
}
