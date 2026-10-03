import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function ForgotPassword() {
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [accountName, setAccountName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleCheckEmail(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/check-email', { email })
      setAccountName(res.data.name)
      setStep('reset')
    } catch (err) {
      setError(err.response?.data?.error || 'No account found with that email address')
    } finally {
      setLoading(false)
    }
  }

  async function handleReset(e) {
    e.preventDefault()
    setError('')
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { email, newPassword })
      setStep('done')
    } catch (err) {
      setError(err.response?.data?.error || 'Could not reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="brand"><i className="fa-solid fa-layer-group"></i> ShopStack</div>
        <div className="login-sub">
          {step === 'email' && 'Find your account'}
          {step === 'reset' && 'Set a new password'}
          {step === 'done' && 'Password updated'}
        </div>

        {error && <div className="form-error">{error}</div>}

        {step === 'email' && (
          <form onSubmit={handleCheckEmail}>
            <p style={{ fontSize: 12.5, color: '#5B6572', marginTop: -6, marginBottom: 16, textAlign: 'center' }}>
              In ShopStack, your email address is also your username. Enter it below to reset your password.
            </p>
            <div className="field">
              <label>Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
            </div>
            <button className="btn-primary" style={{ width: '100%', padding: 11 }} type="submit" disabled={loading}>
              {loading ? 'Checking…' : 'Continue'}
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleReset}>
            <p style={{ fontSize: 12.5, color: '#5B6572', marginTop: -6, marginBottom: 16, textAlign: 'center' }}>
              Account found for <b>{accountName}</b>. Choose a new password below.
            </p>
            <div className="field">
              <label>New password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required autoFocus />
            </div>
            <div className="field">
              <label>Confirm new password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </div>
            <button className="btn-primary" style={{ width: '100%', padding: 11 }} type="submit" disabled={loading}>
              {loading ? 'Updating…' : 'Reset password'}
            </button>
          </form>
        )}

        {step === 'done' && (
          <div style={{ textAlign: 'center' }}>
            <i className="fa-solid fa-circle-check" style={{ fontSize: 40, color: '#1A7A4C', marginBottom: 12 }}></i>
            <p style={{ fontSize: 13, color: '#333' }}>Your password has been updated. You can now sign in with your new password.</p>
            <button className="btn-primary" style={{ width: '100%', padding: 11, marginTop: 10 }} onClick={() => navigate('/login')}>
              Back to sign in
            </button>
          </div>
        )}

        {step !== 'done' && (
          <div className="switch-mode" onClick={() => navigate('/login')}>
            ← Back to sign in
          </div>
        )}
      </div>
    </div>
  )
}