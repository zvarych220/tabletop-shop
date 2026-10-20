import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { api } from '../services/api.js'
import { useProducts } from './useProducts.js'

export default function useBoardGameFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { products: allGlobalProducts } = useProducts()

  const query = searchParams.get('q') ?? ''
  const category = searchParams.get('cat') ?? 'all'
  const minPrice = searchParams.get('minP') ? Number(searchParams.get('minP')) : ''
  const maxPrice = searchParams.get('maxP') ? Number(searchParams.get('maxP')) : ''
  const minRating = searchParams.get('rating') ? Number(searchParams.get('rating')) : 0
  const availableOnly = searchParams.get('available') === '1'
  const sortBy = searchParams.get('sort') ?? 'default'
  const page = searchParams.get('page') ? Math.max(1, Number(searchParams.get('page'))) : 1
  const limit = 8

  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  })
  const [isLoading, setIsLoading] = useState(true)

  // Dynamic categories list from all games in database
  const categories = useMemo(() => {
    const set = new Set(['Стратегія', 'Паті-гра', 'Кооперативна', 'Сімейна'])
    if (Array.isArray(allGlobalProducts)) {
      allGlobalProducts.forEach((p) => {
        if (p.category) set.add(p.category)
      })
    }
    return ['all', ...Array.from(set)]
  }, [allGlobalProducts])

  // Fetch filtered and paginated games directly from backend API
  useEffect(() => {
    let isCancelled = false
    const fetchFiltered = async () => {
      setIsLoading(true)
      try {
        const res = await api.products.getAll({
          page,
          limit,
          search: query.trim() || undefined,
          category: category !== 'all' ? category : undefined,
          minPrice: minPrice !== '' ? minPrice : undefined,
          maxPrice: maxPrice !== '' ? maxPrice : undefined,
          rating: minRating > 0 ? minRating : undefined,
          available: availableOnly ? '1' : undefined,
          sort: sortBy !== 'default' ? sortBy : undefined,
        })

        if (!isCancelled) {
          const list = Array.isArray(res) ? res : (res.data || [])
          setProducts(list)
          if (res.pagination) {
            setPagination(res.pagination)
          } else {
            setPagination({
              page,
              limit,
              total: list.length,
              totalPages: Math.max(1, Math.ceil(list.length / limit)),
              hasNextPage: false,
              hasPrevPage: page > 1,
            })
          }
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Failed to fetch filtered products from backend:', err)
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchFiltered()

    return () => {
      isCancelled = true
    }
  }, [query, category, minPrice, maxPrice, minRating, availableOnly, sortBy, page, limit])

  function updateParam(key, value, resetPage = true) {
    const next = new URLSearchParams(searchParams)
    if (value === '' || value === 'all' || value === null || value === undefined || value === 0) {
      next.delete(key)
    } else {
      next.set(key, String(value))
    }

    if (resetPage && key !== 'page') {
      next.delete('page')
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
    minPrice: minPrice === '' ? 0 : minPrice,
    setMinPrice: (val) => updateParam('minP', val > 0 ? val : ''),
    maxPrice: maxPrice === '' ? '' : maxPrice,
    setMaxPrice: (val) => updateParam('maxP', val > 0 ? val : ''),
    minRating,
    setMinRating: (val) => updateParam('rating', val),
    availableOnly,
    setAvailableOnly: (val) => updateParam('available', val ? '1' : ''),
    sortBy,
    setSortBy: (val) => updateParam('sort', val),
    page,
    setPage: (p) => {
      updateParam('page', p, false)
      window.scrollTo({ top: 120, behavior: 'smooth' })
    },
    visibleItems: products,
    pagination,
    isLoading,
    categories,
    resetFilters,
  }
}