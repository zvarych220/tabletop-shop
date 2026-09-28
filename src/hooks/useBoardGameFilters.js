import { useSearchParams } from 'react-router'

export default function useBoardGameFilters(items) {
  const [searchParams, setSearchParams] = useSearchParams()

  const query = searchParams.get('q') ?? ''
  const availableOnly = searchParams.get('available') === '1'

  const normalizedQuery = query.trim().toLocaleLowerCase('uk')
  const visibleItems = items.filter((item) => {
    const matchesQuery = item.title.toLocaleLowerCase('uk').includes(normalizedQuery)
    const matchesAvailability = !availableOnly || item.inStock
    return matchesQuery && matchesAvailability
  })

  function setQuery(value) {
    const next = new URLSearchParams(searchParams)
    if (value === '') next.delete('q')
    else next.set('q', value)
    setSearchParams(next, { replace: true }) 
  }

  function setAvailableOnly(value) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set('available', '1')
    else next.delete('available')
    setSearchParams(next)
  }

  function resetFilters() {
    const next = new URLSearchParams(searchParams)
    next.delete('q')
    next.delete('available')
    setSearchParams(next)
  }

  return {
    query,
    setQuery,
    availableOnly,
    setAvailableOnly,
    visibleItems,
    resetFilters,
  }
}