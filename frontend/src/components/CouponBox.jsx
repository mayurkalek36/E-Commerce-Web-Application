import { useState } from 'react'
import { useCart } from '../context/CartContext'

export default function CouponBox() {
  const { coupon, applyCouponCode, clearCoupon } = useCart()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [applying, setApplying] = useState(false)

  async function handleApply(e) {
    e.preventDefault()
    if (!code.trim()) return
    setApplying(true)
    setError('')
    try {
      await applyCouponCode(code)
      setCode('')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired coupon code')
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="panel" style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 6, padding: 16 }}>
      <h3 style={{ marginTop: 0, fontSize: 14 }}>Coupon</h3>
      {coupon ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#1A7A4C', fontSize: 12.5 }}>
            <i className="fa-solid fa-tag"></i> {coupon.code} applied — {coupon.discountPercent}% off
          </div>
          <span className="remove-link" onClick={clearCoupon}>Remove</span>
        </div>
      ) : (
        <form onSubmit={handleApply} style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            placeholder="Enter coupon code (try WELCOME10)"
            value={code}
            onChange={e => setCode(e.target.value)}
            style={{ flex: 1, padding: 9, border: '1px solid var(--line)', borderRadius: 5, fontSize: 12.5 }}
          />
          <button className="btn-ghost" type="submit" disabled={applying}>{applying ? 'Checking…' : 'Apply'}</button>
        </form>
      )}
      {error && <div style={{ color: '#C4331F', fontSize: 11.5, marginTop: 8 }}>{error}</div>}
    </div>
  )
}