import { useSearchParams } from 'react-router'
import { selectOrders } from '../domain/selectOrders.js'

export default function useOrderFilters(orders, items) {
  const [searchParams, setSearchParams] = useSearchParams()

  const query = searchParams.get('q') ?? ''
  const consultation = searchParams.get('consultation') ?? 'all'
  const sort = searchParams.get('sort') ?? 'name'

  const visibleOrders = selectOrders(orders, items, {
    query,
    consultation,
    sort,
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
    setSort: (val) => setParameter('sort', val, 'name'),
    resetFilters,
  }
}
