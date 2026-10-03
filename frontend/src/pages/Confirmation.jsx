import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const LABELS = { card: 'Credit / Debit card', upi: 'UPI', netbanking: 'Net banking', wallet: 'Wallet', cod: 'Cash on delivery' }

export default function Confirmation() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const order = state?.order

  if (!order) {
    return (
      <div><Navbar showSearch={false} />
        <div className="empty-state">No recent order found. <a href="#" onClick={() => navigate('/shop')}>Back to shop</a></div>
      </div>
    )
  }

  return (
    <div>
      <Navbar showSearch={false} />
      <div className="confirm-wrap">
        <i className="fa-solid fa-circle-check big-check"></i>
        <h2>Order placed successfully</h2>
        <p style={{ color: '#5B6572', fontSize: 13 }}>A confirmation has been generated. Track your order anytime from your account.</p>
        <div className="order-box">
          <div className="row"><span>Order ID</span><b>#SS-{order.id}</b></div>
          <div className="row"><span>Amount paid</span><b>₹{order.totalAmount.toFixed(0)}</b></div>
          {order.deliveryOption && <div className="row"><span>Delivery</span><b>{order.deliveryOption}{order.deliveryFee > 0 ? ` (₹${order.deliveryFee})` : ' (Free)'}</b></div>}
          <div className="row"><span>Payment method</span><b>{LABELS[state.method] || state.method}</b></div>
          <div className="row"><span>Transaction ID</span><b>{state.transactionId}</b></div>
          <div className="row"><span>Status</span><b>{order.status}</b></div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-outline" style={{ flex: 1 }} onClick={() => navigate('/account')}>Track order</button>
          <button className="btn-primary" style={{ flex: 1 }} onClick={() => navigate('/shop')}>Continue shopping</button>
        </div>
      </div>
    </div>
  )
}