import { useMemo } from 'react'
import { useSearchParams } from 'react-router'

export default function useBoardGameFilters(items) {
  const [searchParams, setSearchParams] = useSearchParams()

  const query = searchParams.get('q') ?? ''
  const category = searchParams.get('cat') ?? 'all'
  const minPrice = searchParams.get('minP') ? Number(searchParams.get('minP')) : 0
  const maxPrice = searchParams.get('maxP') ? Number(searchParams.get('maxP')) : 3500
  const minRating = searchParams.get('rating') ? Number(searchParams.get('rating')) : 0
  const availableOnly = searchParams.get('available') === '1'
  const sortBy = searchParams.get('sort') ?? 'default'

  const normalizedQuery = query.trim().toLocaleLowerCase('uk')

  const visibleItems = useMemo(() => {
    let filtered = items.filter((item) => {
      const matchesQuery = item.title.toLocaleLowerCase('uk').includes(normalizedQuery)
      const matchesCategory = category === 'all' || item.category === category
      const matchesPrice = item.price >= minPrice && item.price <= maxPrice
      const matchesRating = minRating === 0 || (item.rating ?? 5) >= minRating
      const matchesAvailability = !availableOnly || item.inStock
      return matchesQuery && matchesCategory && matchesPrice && matchesRating && matchesAvailability
    })

    if (sortBy === 'price-asc') {
      filtered = [...filtered].sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-desc') {
      filtered = [...filtered].sort((a, b) => b.price - a.price)
    } else if (sortBy === 'rating' || sortBy === 'rating-desc') {
      filtered = [...filtered].sort((a, b) => {
        const diff = (b.rating ?? 5) - (a.rating ?? 5)
        if (diff !== 0) return diff
        return (b.ratingCount ?? 0) - (a.ratingCount ?? 0)
      })
    } else if (sortBy === 'rating-asc') {
      filtered = [...filtered].sort((a, b) => {
        const diff = (a.rating ?? 5) - (b.rating ?? 5)
        if (diff !== 0) return diff
        return (a.ratingCount ?? 0) - (b.ratingCount ?? 0)
      })
    } else if (sortBy === 'title') {
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title, 'uk'))
    }

    return filtered
  }, [items, normalizedQuery, category, minPrice, maxPrice, minRating, availableOnly, sortBy])

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams)
    if (value === '' || value === 'all' || value === null || value === undefined) {
      next.delete(key)
    } else {
      next.set(key, String(value))
    }
    setSearchParams(next, { replace: true })
  }

  function resetFilters() {
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  return {
    query,
    setQuery: (val) => updateParam('q', val),
    category,
    setCategory: (val) => updateParam('cat', val),
    minPrice,
    setMinPrice: (val) => updateParam('minP', val),
    maxPrice,
    setMaxPrice: (val) => updateParam('maxP', val),
    minRating,
    setMinRating: (val) => updateParam('rating', val),
    availableOnly,
    setAvailableOnly: (val) => updateParam('available', val ? '1' : ''),
    sortBy,
    setSortBy: (val) => updateParam('sort', val),
    visibleItems,
    resetFilters,
  }
}