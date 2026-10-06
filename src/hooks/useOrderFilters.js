import { useSearchParams } from 'react-router'

export default function useOrderFilters(orders, items) {
  const [searchParams, setSearchParams] = useSearchParams()

  const query = searchParams.get('q') ?? ''
  const carrier = searchParams.get('carrier') ?? 'all'
  const sort = searchParams.get('sort') ?? 'latest'

  const gameNames = new Map(items.map((i) => [i.id, i.title]))
  const normalizedQuery = query.trim().toLocaleLowerCase('uk')

  const visibleOrders = orders.filter((order) => {
    const text = `${order.fullName ?? ''} ${order.phone ?? ''} ${order.city ?? ''} ${gameNames.get(order.gameId) ?? ''} ${order.comment ?? ''}`.toLocaleLowerCase('uk')
    const matchesCarrier =
      carrier === 'all' ||
      (carrier === 'nova_poshta' ? order.deliveryService === 'nova_poshta' : order.deliveryService === 'ukr_poshta')

    return text.includes(normalizedQuery) && matchesCarrier
  })

  visibleOrders.sort((a, b) => {
    if (sort === 'price-desc') {
      const totalA = a.totalPrice || 0
      const totalB = b.totalPrice || 0
      return totalB - totalA
    }
    if (sort === 'price-asc') {
      const totalA = a.totalPrice || 0
      const totalB = b.totalPrice || 0
      return totalA - totalB
    }
    return b.id.localeCompare(a.id)
  })

  function setParameter(name, value, defaultValue, replace = false) {
    const next = new URLSearchParams(searchParams)
    if (value === defaultValue) next.delete(name)
    else next.set(name, value)
    setSearchParams(next, { replace })
  }

  function resetFilters() {
    const next = new URLSearchParams(searchParams)
    next.delete('q')
    next.delete('carrier')
    next.delete('sort')
    setSearchParams(next)
  }

  return {
    query,
    carrier,
    sort,
    visibleOrders,
    setQuery: (val) => setParameter('q', val, '', true),
    setCarrier: (val) => setParameter('carrier', val, 'all'),
    setSort: (val) => setParameter('sort', val, 'latest'),
    resetFilters,
  }
}
