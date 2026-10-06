import { useState, useEffect, useMemo } from 'react'
import { CartContext } from '../context/CartContext.js'

const CART_STORAGE_KEY = 'dice_deck.cart.v1'

function loadInitialCart() {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // Ignore storage parse error
  }
  return []
}

export default function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(loadInitialCart)
  const [isCartOpen, setIsCartOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
    } catch {
      // Storage write error
    }
  }, [cartItems])

  function addToCart(game, quantity = 1) {
    if (!game) return
    const addQty = Math.max(1, Number(quantity) || 1)

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.gameId === game.id)
      if (existingIndex >= 0) {
        const next = [...prev]
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + addQty,
        }
        return next
      }

      return [
        ...prev,
        {
          id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          gameId: game.id,
          title: game.title,
          price: game.price,
          image: game.image,
          category: game.category,
          quantity: addQty,
        },
      ]
    })
    setIsCartOpen(true)
  }

  function removeFromCart(gameId) {
    setCartItems((prev) => prev.filter((item) => item.gameId !== gameId))
  }

  function updateQuantity(gameId, newQty) {
    if (newQty <= 0) {
      removeFromCart(gameId)
      return
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.gameId === gameId
          ? { ...item, quantity: Math.min(20, Math.max(1, newQty)) }
          : item,
      ),
    )
  }

  function clearCart() {
    setCartItems([])
  }

  const cartTotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  }, [cartItems])

  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0)
  }, [cartItems])

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        toggleCart: () => setIsCartOpen((prev) => !prev),
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
