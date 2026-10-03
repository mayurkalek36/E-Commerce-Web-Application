import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../api'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { key: 'overview', label: 'Marketplace overview', icon: 'fa-gauge' },
  { key: 'vendors', label: 'Vendor management', icon: 'fa-store' },
  { key: 'orders', label: 'Order monitoring', icon: 'fa-truck-fast' },
  { key: 'commission', label: 'Commission', icon: 'fa-percent' },
  { key: 'reports', label: 'Reports & export', icon: 'fa-file-export' }
]

export default function AdminDashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState('overview')
  const [overview, setOverview] = useState(null)
  const [vendors, setVendors] = useState([])
  const [orders, setOrders] = useState([])

  useEffect(() => {
    api.get('/admin/overview').then(res => setOverview(res.data))
    api.get('/vendors').then(res => setVendors(res.data))
    api.get('/orders').then(res => setOrders(res.data))
  }, [tab])

  async function approve(vendorId) {
    await api.patch(`/vendors/${vendorId}/status`, { status: 'APPROVED' })
    api.get('/vendors').then(res => setVendors(res.data))
  }

  async function updateCommission(vendorId, rate) {
    await api.patch(`/vendors/${vendorId}/commission`, { commissionRate: Number(rate) })
    api.get('/vendors').then(res => setVendors(res.data))
  }

  return (
    <div className="dash">
      <Sidebar title="Admin console" rolePill="Admin console" items={NAV} active={tab} onSelect={setTab} />
      <div className="dash-main">
        <div className="dash-top"><h1>Admin console</h1></div>

        {tab === 'overview' && overview && (
          <div className="kpi-row">
            <div className="kpi"><div className="lbl">GMV</div><div className="val">₹{overview.gmv.toFixed(0)}</div></div>
            <div className="kpi"><div className="lbl">Total orders</div><div className="val">{overview.totalOrders}</div></div>
            <div className="kpi"><div className="lbl">Active vendors</div><div className="val">{overview.activeVendors}</div></div>
            <div className="kpi"><div className="lbl">Pending approvals</div><div className="val">{overview.pendingVendorApprovals}</div></div>
            <div className="kpi"><div className="lbl">Total products</div><div className="val">{overview.totalProducts}</div></div>
          </div>
        )}

        {tab === 'vendors' && (
          <div className="panel">
            <table className="dt">
              <thead><tr><th>Vendor</th><th>Category</th><th>Commission %</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {vendors.map(v => (
                  <tr key={v.id}>
                    <td>{v.businessName}</td>
                    <td>{v.category}</td>
                    <td>
                      <input type="number" defaultValue={v.commissionRate} style={{ width: 60, padding: 4 }}
                        onBlur={e => updateCommission(v.id, e.target.value)} />
                    </td>
                    <td>
                      <span className={`status-pill ${v.status === 'APPROVED' ? 'green' : v.status === 'PENDING' ? 'orange' : 'red'}`}>{v.status}</span>
                    </td>
                    <td>{v.status === 'PENDING' && <button className="btn-ghost" onClick={() => approve(v.id)}>Approve</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'orders' && (
          <div className="panel">
            <table className="dt">
              <thead><tr><th>Order ID</th><th>Customer ID</th><th>Amount</th><th>Payment</th><th>Status</th></tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td>#SS-{o.id}</td><td>{o.userId}</td><td>₹{o.totalAmount.toFixed(0)}</td><td>{o.paymentMethod}</td>
                    <td><span className="status-pill orange">{o.status}</span></td>
                  </tr>
                ))}
                {orders.length === 0 && <tr><td colSpan="5" style={{ color: '#5B6572' }}>No orders placed yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'commission' && (
          <div className="panel">
            <h3>Category commission rates</h3>
            <table className="dt">
              <thead><tr><th>Category</th><th>Typical commission</th></tr></thead>
              <tbody>
                <tr><td>Electronics</td><td>8%</td></tr>
                <tr><td>Fashion</td><td>12%</td></tr>
                <tr><td>Home &amp; Kitchen</td><td>10%</td></tr>
              </tbody>
            </table>
            <p style={{ fontSize: 12, color: '#5B6572' }}>Per-vendor commission can be overridden in Vendor management.</p>
          </div>
        )}

        {tab === 'reports' && (
          <div className="panel">
            <h3>Export reports</h3>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn-ghost"><i className="fa-solid fa-file-pdf"></i>&nbsp; Sales report (PDF)</button>
              <button className="btn-ghost"><i className="fa-solid fa-file-excel"></i>&nbsp; Inventory report (Excel)</button>
              <button className="btn-ghost"><i className="fa-solid fa-file-excel"></i>&nbsp; Vendor report (Excel)</button>
            </div>
            <p style={{ fontSize: 11.5, color: '#5B6572', marginTop: 10 }}>
              Export wiring is a placeholder — connect to a report-generation endpoint (e.g. Apache POI for Excel, iText/OpenPDF for PDF) on the backend.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
