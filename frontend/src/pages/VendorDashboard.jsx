import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES } from '../data/categoryMeta'

const NAV = [
  { key: 'overview', label: 'Overview', icon: 'fa-gauge' },
  { key: 'products', label: 'Products', icon: 'fa-boxes-stacked' },
  { key: 'inventory', label: 'Inventory', icon: 'fa-warehouse' },
  { key: 'orders', label: 'Orders', icon: 'fa-receipt' },
  { key: 'analytics', label: 'Analytics', icon: 'fa-chart-line' },
  { key: 'payouts', label: 'Payouts', icon: 'fa-money-check-dollar' }
]

const emptyForm = { name: '', category: 'Electronics', description: '', price: '', mrp: '', stock: '' }

export default function VendorDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')
  const [vendor, setVendor] = useState(null)
  const [products, setProducts] = useState([])
  const [orderItems, setOrderItems] = useState([])
  const [summary, setSummary] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    api.get(`/vendors/user/${user.id}`).then(res => setVendor(res.data)).catch(() => setVendor(null))
  }, [user])

  useEffect(() => {
    if (!vendor) return
    loadProducts()
    api.get(`/orders/vendor/${vendor.id}`).then(res => setOrderItems(res.data))
    api.get(`/vendors/${vendor.id}/summary`).then(res => setSummary(res.data))
  }, [vendor])

  function loadProducts() {
    api.get(`/products/vendor/${vendor.id}`).then(res => setProducts(res.data))
  }

  async function submitProduct(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/products', {
        vendorId: vendor.id,
        name: form.name,
        category: form.category,
        description: form.description,
        price: Number(form.price),
        mrp: Number(form.mrp || form.price),
        stock: Number(form.stock)
      })
      setForm(emptyForm)
      loadProducts()
    } finally {
      setSaving(false)
    }
  }

  if (!vendor) {
    return (
      <div className="dash">
        <Sidebar title="Vendor dashboard" rolePill={`${user?.name} · Vendor`} items={NAV} active={tab} onSelect={setTab} />
        <div className="dash-main"><div className="empty-state">Loading vendor profile…</div></div>
      </div>
    )
  }

  const lowStock = products.filter(p => p.stock > 0 && p.stock < 25).length

  return (
    <div className="dash">
      <Sidebar title="Vendor dashboard" rolePill={`${vendor.businessName} · Vendor`} items={NAV} active={tab} onSelect={setTab} />
      <div className="dash-main">
        <div className="dash-top">
          <h1>Vendor dashboard</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {vendor.status !== 'APPROVED' && <span className="status-pill orange">Awaiting admin approval</span>}
            <span style={{ fontSize: 12.5, color: '#5B6572' }}>Hello, {vendor.businessName}</span>
            <button className="btn-ghost" onClick={() => { logout(); navigate('/login') }}>
              <i className="fa-solid fa-arrow-right-from-bracket"></i>&nbsp; Logout
            </button>
          </div>
        </div>

        {tab === 'overview' && summary && (
          <>
            <div className="kpi-row">
              <div className="kpi"><div className="lbl">Gross sales</div><div className="val">₹{summary.grossSales.toFixed(0)}</div></div>
              <div className="kpi"><div className="lbl">Orders</div><div className="val">{summary.totalOrders}</div></div>
              <div className="kpi"><div className="lbl">Commission rate</div><div className="val">{summary.commissionRate}%</div></div>
              <div className="kpi"><div className="lbl">Low-stock SKUs</div><div className="val">{lowStock}</div></div>
            </div>
            <div className="panel">
              <h3>Pending actions</h3>
              {lowStock > 0 && <div style={{ fontSize: 12.5, padding: '6px 0' }}><i className="fa-solid fa-triangle-exclamation"></i> {lowStock} product(s) below the low-stock threshold</div>}
              {vendor.status !== 'APPROVED' && <div style={{ fontSize: 12.5, padding: '6px 0' }}><i className="fa-solid fa-clock"></i> Your vendor account is pending admin approval</div>}
              {products.filter(p => p.status === 'PENDING_APPROVAL').length > 0 &&
                <div style={{ fontSize: 12.5, padding: '6px 0' }}><i className="fa-solid fa-hourglass-half"></i> {products.filter(p => p.status === 'PENDING_APPROVAL').length} product listing(s) awaiting approval</div>}
            </div>
          </>
        )}

        {tab === 'products' && (
          <>
            <div className="panel">
              <h3>Add a new product</h3>
              <form onSubmit={submitProduct} className="form-grid">
                <div><label>Product name</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div><label>Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><label>Price (₹)</label><input required type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
                <div><label>MRP (₹)</label><input type="number" value={form.mrp} onChange={e => setForm({ ...form, mrp: e.target.value })} /></div>
                <div><label>Stock quantity</label><input required type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} /></div>
                <div><label>Description</label><input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <button className="btn-primary" disabled={saving}>{saving ? 'Adding…' : 'Add product'}</button>
                </div>
              </form>
            </div>
            <div className="panel">
              <table className="dt">
                <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th></tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td>{p.name}</td><td>{p.category}</td><td>₹{p.price}</td><td>{p.stock}</td>
                      <td><span className={`status-pill ${p.status === 'LIVE' ? 'green' : p.status === 'OUT_OF_STOCK' ? 'red' : 'orange'}`}>{p.status.replace('_', ' ')}</span></td>
                    </tr>
                  ))}
                  {products.length === 0 && <tr><td colSpan="5" style={{ color: '#5B6572' }}>No products yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'inventory' && (
          <div className="panel">
            <h3>Stock levels</h3>
            <table className="dt">
              <thead><tr><th>Product</th><th>In stock</th><th>Status</th></tr></thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td><td>{p.stock}</td>
                    <td>{p.stock === 0 ? <span className="status-pill red">Out of stock</span> :
                        p.stock < 25 ? <span className="status-pill orange">Low stock</span> :
                        <span className="status-pill green">Healthy</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'orders' && (
          <div className="panel">
            <table className="dt">
              <thead><tr><th>Order ID</th><th>Product</th><th>Qty</th><th>Amount</th></tr></thead>
              <tbody>
                {orderItems.map(oi => (
                  <tr key={oi.id}>
                    <td>#SS-{oi.orderId}</td><td>{oi.productName}</td><td>{oi.quantity}</td><td>₹{(oi.price * oi.quantity).toFixed(0)}</td>
                  </tr>
                ))}
                {orderItems.length === 0 && <tr><td colSpan="4" style={{ color: '#5B6572' }}>No orders yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'analytics' && summary && (
          <div className="two-col">
            <div className="panel"><h3>Top-selling products</h3>
              <table className="dt">
                <thead><tr><th>Product</th><th>Units sold</th></tr></thead>
                <tbody>
                  {products.map(p => {
                    const units = orderItems.filter(oi => oi.productId === p.id).reduce((s, oi) => s + oi.quantity, 0)
                    return <tr key={p.id}><td>{p.name}</td><td>{units}</td></tr>
                  })}
                </tbody>
              </table>
            </div>
            <div className="panel"><h3>Summary</h3>
              <div className="summary-line"><span>Gross sales</span><span>₹{summary.grossSales.toFixed(0)}</span></div>
              <div className="summary-line"><span>Total orders</span><span>{summary.totalOrders}</span></div>
            </div>
          </div>
        )}

        {tab === 'payouts' && summary && (
          <>
            <div className="kpi-row">
              <div className="kpi"><div className="lbl">Gross sales</div><div className="val">₹{summary.grossSales.toFixed(0)}</div></div>
              <div className="kpi"><div className="lbl">Commission ({summary.commissionRate}%)</div><div className="val">₹{summary.commissionAmount.toFixed(0)}</div></div>
              <div className="kpi"><div className="lbl">Net payout</div><div className="val">₹{summary.netPayout.toFixed(0)}</div></div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}