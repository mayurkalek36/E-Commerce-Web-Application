import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../api'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { key: 'overview', label: 'Stock overview', icon: 'fa-gauge' },
  { key: 'pick', label: 'Pick & pack', icon: 'fa-boxes-packing' },
  { key: 'alerts', label: 'Low stock alerts', icon: 'fa-triangle-exclamation' }
]

export default function WarehouseDashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState('overview')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])

  useEffect(() => {
    api.get('/products').then(res => setProducts(res.data))
    api.get('/orders').then(res => setOrders(res.data))
  }, [])

  const lowStock = products.filter(p => p.stock > 0 && p.stock < 25)
  const outOfStock = products.filter(p => p.stock === 0)
  const toPack = orders.filter(o => ['CONFIRMED', 'PENDING', 'PROCESSING'].includes(o.status))

  return (
    <div className="dash">
      <Sidebar title="Warehouse operations" rolePill={`${user?.name} · Warehouse`} items={NAV} active={tab} onSelect={setTab} />
      <div className="dash-main">
        <div className="dash-top"><h1>Warehouse operations</h1></div>

        {tab === 'overview' && (
          <>
            <div className="kpi-row">
              <div className="kpi"><div className="lbl">Orders to pack</div><div className="val">{toPack.length}</div></div>
              <div className="kpi"><div className="lbl">Total SKUs</div><div className="val">{products.length}</div></div>
              <div className="kpi"><div className="lbl">Out of stock</div><div className="val">{outOfStock.length}</div></div>
              <div className="kpi"><div className="lbl">Low stock</div><div className="val">{lowStock.length}</div></div>
            </div>
            <div className="panel">
              <h3>All SKUs</h3>
              <table className="dt">
                <thead><tr><th>Product</th><th>Category</th><th>In stock</th><th>Status</th></tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td>{p.name}</td><td>{p.category}</td><td>{p.stock}</td>
                      <td>{p.stock === 0 ? <span className="status-pill red">Out of stock</span> :
                          p.stock < 25 ? <span className="status-pill orange">Low</span> :
                          <span className="status-pill green">Healthy</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'pick' && (
          <div className="panel">
            <h3>Orders awaiting pick &amp; pack</h3>
            <table className="dt">
              <thead><tr><th>Order ID</th><th>Amount</th><th>Payment</th><th>Status</th></tr></thead>
              <tbody>
                {toPack.map(o => (
                  <tr key={o.id}>
                    <td>#SS-{o.id}</td><td>₹{o.totalAmount.toFixed(0)}</td><td>{o.paymentMethod}</td>
                    <td><span className="status-pill orange">{o.status}</span></td>
                  </tr>
                ))}
                {toPack.length === 0 && <tr><td colSpan="4" style={{ color: '#5B6572' }}>Nothing to pack right now.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'alerts' && (
          <div className="panel">
            <h3>Stock alerts</h3>
            {lowStock.map(p => (
              <div key={p.id} style={{ padding: '8px 0', borderBottom: '1px solid #F0F2F4', fontSize: 12.5 }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ color: '#C4331F', marginRight: 8 }}></i>
                {p.name} — {p.stock} units left
              </div>
            ))}
            {outOfStock.map(p => (
              <div key={p.id} style={{ padding: '8px 0', borderBottom: '1px solid #F0F2F4', fontSize: 12.5 }}>
                <i className="fa-solid fa-circle-xmark" style={{ color: '#C4331F', marginRight: 8 }}></i>
                {p.name} — out of stock
              </div>
            ))}
            {lowStock.length === 0 && outOfStock.length === 0 && <div style={{ color: '#5B6572', fontSize: 12.5 }}>All stock levels are healthy.</div>}
          </div>
        )}
      </div>
    </div>
  )
}
