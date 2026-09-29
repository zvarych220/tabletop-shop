import { useSearchParams } from 'react-router'

export default function useOrderFilters(orders, items) {
  const [searchParams, setSearchParams] = useSearchParams()

  const query = searchParams.get('q') ?? ''
  const rawHelp = searchParams.get('consultation')
  const consultation = ['yes', 'no'].includes(rawHelp) ? rawHelp : 'all'

  const rawSort = searchParams.get('sort')
  const sort = ['duration-asc', 'duration-desc'].includes(rawSort) ? rawSort : 'game'

  const gameNames = new Map(items.map((i) => [i.id, i.title]))
  const normalizedQuery = query.trim().toLocaleLowerCase('uk')

  const visibleOrders = orders.filter((order) => {
    const text = `${gameNames.get(order.gameId) ?? ''} ${order.comment}`.toLocaleLowerCase('uk')
    const matchesConsultation =
      consultation === 'all' ||
      (consultation === 'yes' ? order.needsConsultation : !order.needsConsultation)
    return text.includes(normalizedQuery) && matchesConsultation
  })

  visibleOrders.sort((a, b) => {
    let order
    if (sort === 'duration-asc') order = a.durationHours - b.durationHours
    else if (sort === 'duration-desc') order = b.durationHours - a.durationHours
    else {
      order = (gameNames.get(a.gameId) ?? '').localeCompare(gameNames.get(b.gameId) ?? '', 'uk')
    }
    return order || a.id.localeCompare(b.id)
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
    next.delete('consultation')
    next.delete('sort')
    setSearchParams(next)
  }

  return {
    query,
    consultation,
    sort,
    visibleOrders,
    setQuery: (val) => setParameter('q', val, '', true),
    setConsultation: (val) => setParameter('consultation', val, 'all'),
    setSort: (val) => setParameter('sort', val, 'game'),
    resetFilters,
  }
}
