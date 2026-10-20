import { useState, useEffect } from 'react'
import { ProductsContext } from '../context/ProductsContext.js'
import { api } from '../services/api.js'

export default function ProductsProvider({ children }) {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch products from API on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        const data = await api.products.getAll({ all: 1 })
        setProducts(Array.isArray(data) ? data : (data.data || []))
      } catch (err) {
        console.error('Failed to fetch products:', err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const refreshProducts = async () => {
    try {
      const data = await api.products.getAll({ all: 1 })
      setProducts(Array.isArray(data) ? data : (data.data || []))
    } catch (err) {
      console.error('Failed to refresh products:', err)
      throw err
    }
  }

  const createProduct = async (productData) => {
    try {
      const newProduct = await api.products.create(productData)
      setProducts(prev => [newProduct, ...prev])
      return newProduct
    } catch (err) {
      console.error('Failed to create product:', err)
      throw err
    }
  }

  const updateProduct = async (id, productData) => {
    try {
      const updatedProduct = await api.products.update(id, productData)
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p))
      return updatedProduct
    } catch (err) {
      console.error('Failed to update product:', err)
      throw err
    }
  }

  const deleteProduct = async (id) => {
    try {
      await api.products.delete(id)
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      console.error('Failed to delete product:', err)
      throw err
    }
  }

  const value = {
    products,
    setProducts,
    isLoading,
    error,
    refreshProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  }

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}
