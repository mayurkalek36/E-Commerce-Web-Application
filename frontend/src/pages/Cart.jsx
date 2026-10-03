import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StepsNav from '../components/StepsNav'
import CouponBox from '../components/CouponBox'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { user } = useAuth()
  const { items, refresh, updateQuantity, removeItem, subtotal, discount, total } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) refresh(user.id)
    else navigate('/login')
  }, [user])

  return (
    <div>
      <Navbar showSearch={false} />
      <div className="flow-wrap">
        <StepsNav current="cart" />
        <div style={{ marginBottom: 14 }}>
          <button className="btn-ghost" onClick={() => navigate('/shop')}>← Back to shop</button>
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            <p>Your cart is empty.</p>
            <button className="btn-primary" onClick={() => navigate('/shop')}>Continue shopping</button>
          </div>
        ) : (
          <div className="flow-grid">
            <div>
              {items.map(item => (
                <div className="cart-row" key={item.cartItemId}>
                  <div className="thumb-sm" style={{ background: '#3B4B63' }}><i className="fa-solid fa-box"></i></div>
                  <div className="info">
                    <div className="t">{item.name}</div>
                    <div className="qty-box">
                      <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1, user.id)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1, user.id)}>+</button>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 90, fontWeight: 700 }}>
                    ₹{(item.price * item.quantity).toLocaleString()}
                    <div className="remove-link" onClick={() => removeItem(item.cartItemId, user.id)}>Remove</div>
                  </div>
                </div>
              ))}
              <CouponBox />
            </div>
            <div className="summary-card">
              <h3 style={{ marginTop: 0 }}>Price details ({items.length} items)</h3>
              <div className="summary-line"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
              {discount > 0 && <div className="summary-line"><span>Coupon discount</span><span style={{ color: '#1A7A4C' }}>− ₹{discount.toFixed(0)}</span></div>}
              <div className="summary-line"><span>Delivery</span><span style={{ color: '#1A7A4C' }}>Calculated next step</span></div>
              <div className="summary-line total"><span>Total payable</span><span>₹{total.toFixed(0)}</span></div>
              <button className="btn-primary" style={{ width: '100%', marginTop: 14 }} onClick={() => navigate('/checkout')}>Next: Address →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}