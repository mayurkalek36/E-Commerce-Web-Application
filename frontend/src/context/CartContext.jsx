import { createContext, useContext, useState, useCallback } from 'react'
import api from '../api'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [coupon, setCoupon] = useState(null)

  const refresh = useCallback(async (userId) => {
    if (!userId) return
    const res = await api.get(`/cart/${userId}`)
    setItems(res.data)
  }, [])

  async function addToCart(userId, productId, quantity = 1) {
    await api.post('/cart', { userId, productId, quantity })
    await refresh(userId)
  }

  async function updateQuantity(cartItemId, quantity, userId) {
    await api.patch(`/cart/item/${cartItemId}`, { quantity })
    await refresh(userId)
  }

  async function removeItem(cartItemId, userId) {
    await api.delete(`/cart/item/${cartItemId}`)
    await refresh(userId)
  }

  async function applyCouponCode(code) {
    const res = await api.get(`/coupons/validate/${encodeURIComponent(code.trim())}`)
    setCoupon({ code: res.data.code, discountPercent: res.data.discountPercent })
  }

  function clearCoupon() {
    setCoupon(null)
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const discount = coupon ? subtotal * (coupon.discountPercent / 100) : 0
  const total = subtotal - discount

  return (
    <CartContext.Provider value={{
      items, refresh, addToCart, updateQuantity, removeItem,
      coupon, setCoupon, applyCouponCode, clearCoupon, subtotal, discount, total
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}