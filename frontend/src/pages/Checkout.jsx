import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StepsNav from '../components/StepsNav'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const emptyForm = { tag: 'HOME', fullName: '', phone: '', line: '', city: '', state: '', pincode: '' }

export default function Checkout() {
  const { user } = useAuth()
  const [addresses, setAddresses] = useState([])
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deliveryOptions, setDeliveryOptions] = useState([])
  const [deliveryKey, setDeliveryKey] = useState('STANDARD')
  const { subtotal, discount, total } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    loadAddresses()
    api.get('/delivery-options').then(res => setDeliveryOptions(res.data))
  }, [])

  function loadAddresses() {
    api.get(`/addresses/user/${user.id}`).then(res => {
      setAddresses(res.data)
      if (res.data.length > 0) setSelected(res.data[0].id)
      else setShowForm(true)
    })
  }

  async function submitAddress(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.post('/addresses', { ...form, userId: user.id })
      setAddresses(prev => [...prev, res.data])
      setSelected(res.data.id)
      setShowForm(false)
      setForm(emptyForm)
    } finally {
      setSaving(false)
    }
  }

  async function deleteAddress(id, e) {
    e.stopPropagation()
    await api.delete(`/addresses/${id}`)
    const remaining = addresses.filter(a => a.id !== id)
    setAddresses(remaining)
    if (selected === id) setSelected(remaining[0]?.id ?? null)
  }

  function formatAddress(a) {
    return `${a.fullName}, ${a.line}, ${a.city}, ${a.state} – ${a.pincode}`
  }

  const selectedAddress = addresses.find(a => a.id === selected)
  const selectedDelivery = deliveryOptions.find(d => d.key === deliveryKey)
  const grandTotal = total + (selectedDelivery?.fee || 0)

  const ICONS = { STANDARD: 'fa-truck', FAST: 'fa-bolt', EXTREME: 'fa-rocket' }

  return (
    <div>
      <Navbar showSearch={false} />
      <div className="flow-wrap">
        <StepsNav current="address" />
        <div style={{ marginBottom: 14 }}>
          <button className="btn-ghost" onClick={() => navigate('/cart')}>← Back to cart</button>
        </div>
        <div className="flow-grid">
          <div>
            <div className="panel">
              <h3>Deliver to</h3>

              {addresses.map(a => (
                <div key={a.id} className={`addr-card ${selected === a.id ? 'selected' : ''}`} onClick={() => setSelected(a.id)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className="status-pill grey">{a.tag}</span>
                    <span className="remove-link" onClick={e => deleteAddress(a.id, e)}>Remove</span>
                  </div>
                  <div style={{ fontWeight: 600, marginTop: 6 }}>{a.fullName} · {a.phone}</div>
                  <div style={{ fontSize: 12.5, color: '#5B6572', marginTop: 4 }}>
                    {a.line}, {a.city}, {a.state} – {a.pincode}
                  </div>
                </div>
              ))}

              {!showForm && (
                <button className="btn-ghost" onClick={() => setShowForm(true)}>
                  <i className="fa-solid fa-plus"></i>&nbsp; Add a new address
                </button>
              )}

              {showForm && (
                <form onSubmit={submitAddress} className="form-grid" style={{ background: '#FAFBFC', padding: 14, borderRadius: 6, marginTop: 6 }}>
                  <div>
                    <label>Label</label>
                    <select value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })}>
                      <option value="HOME">Home</option>
                      <option value="OFFICE">Office</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div><label>Phone number</label><input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label>Full name</label>
                    <input required value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label>Address line</label>
                    <input required value={form.line} onChange={e => setForm({ ...form, line: e.target.value })} placeholder="House / street / area" />
                  </div>
                  <div><label>City</label><input required value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
                  <div><label>State</label><input required value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} /></div>
                  <div><label>Pincode</label><input required value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} /></div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, marginTop: 4 }}>
                    <button className="btn-primary" disabled={saving} type="submit">{saving ? 'Saving…' : 'Save address'}</button>
                    {addresses.length > 0 && (
                      <button type="button" className="btn-ghost" onClick={() => { setShowForm(false); setForm(emptyForm) }}>Cancel</button>
                    )}
                  </div>
                </form>
              )}
            </div>

            <div className="panel">
              <h3>Delivery options</h3>
              {deliveryOptions.map(d => (
                <div
                  key={d.key}
                  className={`pay-opt ${deliveryKey === d.key ? 'selected' : ''}`}
                  onClick={() => setDeliveryKey(d.key)}
                >
                  <i className={`fa-solid ${ICONS[d.key] || 'fa-truck'}`}></i>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                      {d.label} — {d.fee > 0 ? `₹${d.fee}` : 'Free'}
                    </div>
                    <div style={{ fontSize: 11, color: '#5B6572' }}>{d.eta}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="summary-card">
            <h3 style={{ marginTop: 0 }}>Order summary</h3>
            <div className="summary-line"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
            {discount > 0 && <div className="summary-line"><span>Discount</span><span style={{ color: '#1A7A4C' }}>− ₹{discount.toFixed(0)}</span></div>}
            <div className="summary-line"><span>Delivery ({selectedDelivery?.label || 'Standard'})</span><span>{selectedDelivery?.fee ? `₹${selectedDelivery.fee}` : 'Free'}</span></div>
            <div className="summary-line total"><span>Total payable</span><span>₹{grandTotal.toFixed(0)}</span></div>
            <button
              className="btn-primary"
              style={{ width: '100%', marginTop: 14 }}
              disabled={!selectedAddress}
              onClick={() => navigate('/payment', {
                state: {
                  address: formatAddress(selectedAddress),
                  deliveryKey,
                  deliveryLabel: selectedDelivery?.label,
                  deliveryFee: selectedDelivery?.fee || 0
                }
              })}
            >
              Next: Payment →
            </button>
            {!selectedAddress && <div style={{ fontSize: 11, color: '#C4331F', marginTop: 6 }}>Select or add a delivery address to continue.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}