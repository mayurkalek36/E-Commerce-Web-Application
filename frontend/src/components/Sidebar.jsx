import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Sidebar({ title, rolePill, items, active, onSelect }) {
  const navigate = useNavigate()
  const { logout } = useAuth()

  return (
    <div className="dash-side">
      <div className="brand"><i className="fa-solid fa-layer-group"></i> ShopStack</div>
      <div className="role-pill"><i className="fa-solid fa-circle-user"></i> {rolePill}</div>
      <div className="dash-nav">
        {items.map(item => (
          <a key={item.key} className={active === item.key ? 'on' : ''} onClick={() => onSelect(item.key)}>
            <i className={`fa-solid ${item.icon}`}></i> {item.label}
          </a>
        ))}
        <a onClick={() => navigate('/shop')}><i className="fa-solid fa-store"></i> View storefront</a>
        <a onClick={() => { logout(); navigate('/login') }}><i className="fa-solid fa-arrow-right-from-bracket"></i> Sign out</a>
      </div>
    </div>
  )
}
