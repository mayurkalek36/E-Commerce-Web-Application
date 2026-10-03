import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StepsNav from '../components/StepsNav'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Payment() {
  const [stage, setStage] = useState('idle') // idle | processing | error
  const [errorMsg, setErrorMsg] = useState('')
  const { state } = useLocation()
  const { user } = useAuth()
  const { subtotal, discount, total, coupon, refresh } = useCart()
  const navigate = useNavigate()

  async function finalizeOrder(paymentMethod, transactionId) {
    const orderRes = await api.post('/orders', {
      userId: user.id,
      shippingAddress: state?.address || 'Default address',
      paymentMethod,
      couponCode: coupon?.code,
      transactionId
    })
    await refresh(user.id)
    navigate('/confirmation', { state: { order: orderRes.data, method: paymentMethod, transactionId } })
  }

  async function payOnline() {
    setStage('processing')
    setErrorMsg('')

    if (typeof window.Razorpay === 'undefined') {
      setStage('error')
      setErrorMsg('Razorpay checkout script failed to load. Check your internet connection and reload the page.')
      return
    }

    try {
      const { data: rzOrder } = await api.post('/razorpay/create-order', { amount: total })

      const options = {
        key: rzOrder.keyId,
        amount: rzOrder.amount,
        currency: rzOrder.currency,
        name: 'ShopStack',
        description: 'Order payment',
        order_id: rzOrder.orderId,
        prefill: { name: user.name, email: user.email },
        theme: { color: '#FF7A1A' },
        handler: async function (response) {
          try {
            const verifyRes = await api.post('/razorpay/verify', {
              userId: user.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
            await finalizeOrder(verifyRes.data.method, verifyRes.data.transactionId)
          } catch (err) {
            setStage('error')
            setErrorMsg(err.response?.data?.error || 'Payment succeeded but could not be verified. Please contact support.')
          }
        },
        modal: {
          ondismiss: function () {
            setStage('idle')
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (response) {
        setStage('error')
        setErrorMsg(response.error?.description || 'Payment failed. Please try again.')
      })
      rzp.open()
    } catch (err) {
      setStage('error')
      setErrorMsg(err.response?.data?.error || 'Could not start payment. Please try again.')
    }
  }

  async function payCOD() {
    setStage('processing')
    setErrorMsg('')
    try {
      const payRes = await api.post('/payments/process', { userId: user.id, amount: total, method: 'cod' })
      await finalizeOrder('cod', payRes.data.transactionId)
    } catch (err) {
      setStage('error')
      setErrorMsg(err.response?.data?.error || 'Could not place order.')
    }
  }

  return (
    <div>
      <Navbar showSearch={false} />
      <div className="flow-wrap">
        <StepsNav current="payment" />
        <div style={{ marginBottom: 14 }}>
          <button className="btn-ghost" disabled={stage === 'processing'} onClick={() => navigate('/checkout')}>← Back to address</button>
        </div>
        <div className="flow-grid">
          <div>
            <div className="panel">
              <h3>Pay online</h3>
              <p style={{ fontSize: 12.5, color: '#5B6572', marginTop: -6 }}>
                Opens Razorpay's secure checkout — choose Card, UPI, Netbanking, or Wallet inside it.
              </p>
              <button
                className="btn-primary"
                style={{ width: '100%', padding: 12, marginTop: 6 }}
                disabled={stage === 'processing'}
                onClick={payOnline}
              >
                {stage === 'processing' ? 'Waiting for payment…' : `Pay ₹${total.toFixed(0)} online`}
              </button>
              <div style={{ fontSize: 11, color: '#5B6572', marginTop: 10 }}>
                <b>Test mode</b> — use card 4111 1111 1111 1111, any future expiry, any CVV, and any OTP (e.g. 1234, or check the widget for the exact test OTP). For UPI test mode, use success@razorpay.
              </div>
            </div>

            <div className="panel">
              <h3>Cash on delivery</h3>
              <p style={{ fontSize: 12.5, color: '#5B6572', marginTop: -6 }}>Pay in cash when your order arrives.</p>
              <button className="btn-outline" style={{ width: '100%', padding: 11 }} disabled={stage === 'processing'} onClick={payCOD}>
                Place order (COD)
              </button>
            </div>

            {stage === 'error' && (
              <div className="form-error">
                <i className="fa-solid fa-triangle-exclamation"></i> {errorMsg}
              </div>
            )}

            <div className="panel" style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 12, color: '#5B6572' }}>
              <i className="fa-solid fa-lock" style={{ color: '#1A7A4C' }}></i>
              Payments are processed by Razorpay in test mode — a real payment gateway, no real money moves.
            </div>
          </div>

          <div className="summary-card">
            <h3 style={{ marginTop: 0 }}>Order summary</h3>
            <div className="summary-line"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
            {discount > 0 && <div className="summary-line"><span>Discount</span><span style={{ color: '#1A7A4C' }}>− ₹{discount.toFixed(0)}</span></div>}
            <div className="summary-line total"><span>Total payable</span><span>₹{total.toFixed(0)}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}