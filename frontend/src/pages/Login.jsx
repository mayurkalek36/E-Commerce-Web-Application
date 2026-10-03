import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const ROLE_HOME = {
  CUSTOMER: '/shop',
  VENDOR: '/vendor',
  ADMIN: '/admin',
  WAREHOUSE: '/warehouse'
}

const DEMO_CREDS = {
  CUSTOMER: { email: 'priya@example.com', password: 'password123' },
  VENDOR: { email: 'nimbus@vendor.com', password: 'vendor123' },
  ADMIN: { email: 'admin@shopstack.com', password: 'admin123' },
  WAREHOUSE: { email: 'warehouse@shopstack.com', password: 'warehouse123' }
}

export default function Login() {
  const [role, setRole] = useState('CUSTOMER')
  const [mode, setMode] = useState('login') // login | register
  const [email, setEmail] = useState(DEMO_CREDS.CUSTOMER.email)
  const [password, setPassword] = useState(DEMO_CREDS.CUSTOMER.password)
  const [name, setName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { state } = useLocation()
  const { login } = useAuth()
  const { refresh } = useCart()

  function pickRole(r) {
    setRole(r)
    setEmail(DEMO_CREDS[r].email)
    setPassword(DEMO_CREDS[r].password)
  }

  function redirectAfterAuth(userData) {
    // If they were sent here mid-purchase (e.g. clicked "Buy now" while signed out),
    // send them right back to that product instead of the generic role home page.
    if (userData.role === 'CUSTOMER' && state?.from) {
      navigate(state.from)
    } else {
      navigate(ROLE_HOME[userData.role] || '/shop')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      if (mode === 'login') {
        const res = await api.post('/auth/login', { email, password })
        login(res.data)
        if (res.data.role === 'CUSTOMER') await refresh(res.data.id)
        redirectAfterAuth(res.data)
      } else {
        const res = await api.post('/auth/register', { name, email, password, role, businessName })
        login(res.data)
        redirectAfterAuth(res.data)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Is the backend running on port 8080?')
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="brand"><i className="fa-solid fa-layer-group"></i> ShopStack</div>
        <div className="login-sub">{mode === 'login' ? 'Sign in to the marketplace' : 'Create your account'}</div>

        {state?.message && (
          <div style={{ background: '#FFF8F1', color: '#E5650A', fontSize: 12, padding: '8px 10px', borderRadius: 5, marginBottom: 14, textAlign: 'center' }}>
            {state.message}
          </div>
        )}

        <div className="role-tabs">
          {['CUSTOMER', 'VENDOR', 'ADMIN', 'WAREHOUSE'].map(r => (
            <button key={r} className={role === r ? 'on' : ''} onClick={() => pickRole(r)} type="button">
              {r.charAt(0) + r.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="field">
              <label>Full name</label>
              <input value={name} onChange={e => setName(e.target.value)} required />
            </div>
          )}
          {mode === 'register' && role === 'VENDOR' && (
            <div className="field">
              <label>Business name</label>
              <input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="e.g. Nimbus Audio" required />
            </div>
          )}
          <div className="field">
            <label>Email address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {mode === 'login' && (
            <div style={{ textAlign: 'right', marginTop: -8, marginBottom: 14 }}>
              <a href="#" onClick={e => { e.preventDefault(); navigate('/forgot-password') }} style={{ fontSize: 12 }}>
                Forgot password?
              </a>
            </div>
          )}
          <button className="btn-primary" style={{ width: '100%', padding: 11 }} type="submit">
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="switch-mode" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? "New to ShopStack? Create an account" : 'Already have an account? Sign in'}
        </div>
        <div className="switch-mode" style={{ marginTop: 6 }} onClick={() => navigate('/shop')}>
          ← Continue browsing without signing in
        </div>
      </div>
    </div>
  )
}