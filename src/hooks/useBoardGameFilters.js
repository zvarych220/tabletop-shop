import { useState } from 'react'

export default function useBoardGameFilters(items) {
  const [query, setQuery] = useState('')
  const [availableOnly, setAvailableOnly] = useState(false)

  const normalizedQuery = query.trim().toLocaleLowerCase('uk')

  const visibleItems = items.filter((item) => {
    const matchesQuery = item.title.toLocaleLowerCase('uk').includes(normalizedQuery)
    const matchesAvailability = !availableOnly || item.inStock
    return matchesQuery && matchesAvailability
  })

  function resetFilters() {
    setQuery('')
    setAvailableOnly(false)
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