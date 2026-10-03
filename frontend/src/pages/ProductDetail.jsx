import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const { user } = useAuth()
  const { addToCart } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    api.get(`/products/${id}`).then(res => setProduct(res.data))
  }, [id])

  if (!product) return <div><Navbar /><div className="empty-state">Loading product…</div></div>

  async function handleAdd(goToCart) {
    if (!user) {
      navigate('/login', { state: { from: `/product/${id}`, message: 'Sign in to add items to your cart and check out.' } })
      return
    }
    await addToCart(user.id, product.id, 1)
    navigate(goToCart ? '/cart' : '/checkout')
  }

  return (
    <div>
      <Navbar />
      <div className="pd-wrap">
        <div>
          <div className="pd-image" style={{ background: 'linear-gradient(135deg,#3B4B63,#1F2A3B)' }}>
            <i className="fa-solid fa-headphones-simple"></i>
          </div>
        </div>
        <div className="pd-info">
          <h1>{product.name}</h1>
          <div className="vendor-line">{product.category} · <span className="stars">★★★★☆ ({product.rating?.toFixed(1)})</span></div>
          <div className="pd-price">
            ₹{product.price.toLocaleString()}
            {product.mrp > product.price && <span className="strike" style={{ marginLeft: 8 }}>₹{product.mrp.toLocaleString()}</span>}
          </div>
          <p style={{ fontSize: 13.5, color: '#333', maxWidth: 460 }}>{product.description}</p>
        </div>
        <div className="buybox">
          <div className="pd-price">₹{product.price.toLocaleString()}</div>
          <div className="stock">
            {product.stock > 0
              ? <><i className="fa-solid fa-circle-check"></i> In stock — {product.stock} available</>
              : <span style={{ color: '#C4331F' }}><i className="fa-solid fa-circle-xmark"></i> Out of stock</span>}
          </div>
          <button className="btn-primary" disabled={product.stock === 0} onClick={() => handleAdd(true)}>Add to cart</button>
          <button className="btn-outline" disabled={product.stock === 0} onClick={() => handleAdd(false)}>Buy now</button>
        </div>
      </div>
    </div>
  )
}