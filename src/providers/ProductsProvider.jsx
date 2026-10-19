import { useState, useEffect } from 'react'
import { ProductsContext } from '../context/ProductsContext.js'
import { boardGames } from '../data/boardGames.js'

export default function ProductsProvider({ children }) {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_products')
      return saved ? JSON.parse(saved) : boardGames
    } catch {
      return boardGames
    }
  })

  // Save products to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('admin_products', JSON.stringify(products))
    } catch (error) {
      console.error('Failed to save products to localStorage:', error)
    }
  }, [products])

  const value = {
    products,
    setProducts,
  }

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}
