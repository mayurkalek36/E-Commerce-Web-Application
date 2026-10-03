import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useLanguage } from '../context/LanguageContext'
import LocationPicker from './LocationPicker'
import LanguageSwitcher from './LanguageSwitcher'

export default function Navbar({ showSearch = true }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { items } = useCart()
  const { t } = useLanguage()
  const count = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <div className="topnav">
      <div className="brand" onClick={() => navigate('/shop')}>
        <i className="fa-solid fa-layer-group"></i> ShopStack
      </div>
      {showSearch && (
        <div className="searchbar">
          <input type="text" placeholder={t('searchPlaceholder')} />
          <button><i className="fa-solid fa-magnifying-glass"></i></button>
        </div>
      )}
      <div className="nav-actions">
        <LocationPicker />
        <LanguageSwitcher />
        {user ? (
          <div className="item" onClick={() => navigate('/account')}>
            <small>Hello, {user.name.split(' ')[0]}</small>
            <strong>{t('ordersAccount')}</strong>
          </div>
        ) : (
          <div className="item" onClick={() => navigate('/login')}>
            <small>{t('helloSignIn')}</small>
            <strong>{t('accountOrders')}</strong>
          </div>
        )}
        <div className="item" onClick={() => user ? navigate('/cart') : navigate('/login', { state: { from: '/cart', message: 'Sign in to view your cart.' } })}>
          <span className="cart-icon">
            <i className="fa-solid fa-cart-shopping"></i>
            <span className="cart-badge">{count}</span>
          </span>
        </div>
      </div>
    </div>
  )
}