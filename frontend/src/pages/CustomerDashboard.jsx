import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../api'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { key: 'overview', label: 'Overview', icon: 'fa-gauge' },
  { key: 'orders', label: 'Orders', icon: 'fa-box' },
  { key: 'wishlist', label: 'Wishlist', icon: 'fa-heart' },
  { key: 'addresses', label: 'Addresses', icon: 'fa-location-dot' },
  { key: 'profile', label: 'Profile settings', icon: 'fa-user-gear' }
]

const STATUS_CLASS = {
  CONFIRMED: 'orange', PENDING: 'orange', PROCESSING: 'orange',
  SHIPPED: 'green', DELIVERED: 'grey', RETURNED: 'red', REFUNDED: 'red', CANCELLED: 'red'
}

const emptyForm = { tag: 'HOME', fullName: '', phone: '', line: '', city: '', state: '', pincode: '' }

export default function CustomerDashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState('overview')
  const [orders, setOrders] = useState([])
  const [addresses, setAddresses] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      api.get(`/orders/user/${user.id}`).then(res => setOrders(res.data))
      loadAddresses()
    }
  }, [user])

  function loadAddresses() {
    api.get(`/addresses/user/${user.id}`).then(res => setAddresses(res.data))
  }

  async function submitAddress(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/addresses', { ...form, userId: user.id })
      setForm(emptyForm)
      setShowForm(false)
      loadAddresses()
    } finally {
      setSaving(false)
    }
  }

  async function deleteAddress(id) {
    await api.delete(`/addresses/${id}`)
    loadAddresses()
  }

  const active = orders.filter(o => !['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(o.status)).length
  const delivered = orders.filter(o => o.status === 'DELIVERED').length

  return (
    <div className="dash">
      <Sidebar title="My account" rolePill={`${user?.name} · Customer`} items={NAV} active={tab} onSelect={setTab} />
      <div className="dash-main">
        <div className="dash-top"><h1>My account</h1></div>

        {tab === 'overview' && (
          <>
            <div className="kpi-row">
              <div className="kpi"><div className="lbl">Active orders</div><div className="val">{active}</div></div>
              <div className="kpi"><div className="lbl">Delivered orders</div><div className="val">{delivered}</div></div>
              <div className="kpi"><div className="lbl">Wishlist items</div><div className="val">3</div></div>
              <div className="kpi"><div className="lbl">Reward points</div><div className="val">1,240</div></div>
            </div>
            <div className="panel">
              <h3>Recent activity</h3>
              {orders.slice(0, 4).map(o => (
                <div key={o.id} style={{ padding: '8px 0', borderBottom: '1px solid #F0F2F4', fontSize: 12.5 }}>
                  <i className="fa-solid fa-circle-check" style={{ color: '#1A7A4C', marginRight: 8 }}></i>
                  Order #SS-{o.id} — <b>{o.status}</b> — ₹{o.totalAmount.toFixed(0)}
                </div>
              ))}
              {orders.length === 0 && <div style={{ color: '#5B6572', fontSize: 12.5 }}>No orders yet — head to the storefront to place your first one.</div>}
            </div>
          </>
        )}

        {tab === 'orders' && (
          <div className="panel">
            <table className="dt">
              <thead><tr><th>Order ID</th><th>Amount</th><th>Payment</th><th>Status</th><th>Placed on</th></tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td>#SS-{o.id}</td>
                    <td>₹{o.totalAmount.toFixed(0)}</td>
                    <td>{o.paymentMethod}</td>
                    <td><span className={`status-pill ${STATUS_CLASS[o.status] || 'grey'}`}>{o.status}</span></td>
                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {orders.length === 0 && <tr><td colSpan="5" style={{ color: '#5B6572' }}>No orders placed yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'wishlist' && (
          <div className="grid" style={{ padding: 0 }}>
            {['Nimbus Audio Pro Buds', 'Trail & Co Trek Boots', 'Verve 43" Smart TV'].map(name => (
              <div className="pcard" key={name}>
                <div className="thumb" style={{ background: '#3B4B63' }}><i className="fa-solid fa-heart"></i></div>
                <div className="title">{name}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'addresses' && (
          <>
            {addresses.map(a => (
              <div className="addr-card" key={a.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="status-pill grey">{a.tag}</span>
                  <span className="remove-link" onClick={() => deleteAddress(a.id)}>Remove</span>
                </div>
                <div style={{ fontWeight: 600, marginTop: 6 }}>{a.fullName} · {a.phone}</div>
                <div style={{ marginTop: 4, fontSize: 12.5, color: '#5B6572' }}>{a.line}, {a.city}, {a.state} – {a.pincode}</div>
              </div>
            ))}
            {addresses.length === 0 && <div style={{ color: '#5B6572', fontSize: 12.5, marginBottom: 10 }}>No saved addresses yet.</div>}

            {!showForm && (
              <button className="btn-ghost" onClick={() => setShowForm(true)}><i className="fa-solid fa-plus"></i>&nbsp; Add new address</button>
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
                  <button type="button" className="btn-ghost" onClick={() => { setShowForm(false); setForm(emptyForm) }}>Cancel</button>
                </div>
              </form>
            )}
          </>
        )}

        {tab === 'profile' && (
          <div className="panel">
            <h3>Personal information</h3>
            <div className="form-grid">
              <div><label>Full name</label><input defaultValue={user?.name} /></div>
              <div><label>Email</label><input defaultValue={user?.email} /></div>
            </div>
            <button className="btn-primary" style={{ marginTop: 14 }}>Save changes</button>
          </div>
        )}
      </div>
    </div>
  )
}