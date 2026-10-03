import { useNavigate } from 'react-router-dom'
import { categoryIcon, categoryColor } from '../data/categoryMeta'

export default function ProductCard({ product }) {
  const navigate = useNavigate()
  const off = product.mrp > 0 ? Math.round((1 - product.price / product.mrp) * 100) : 0
  return (
    <div className="pcard" onClick={() => navigate(`/product/${product.id}`)}>
      <div className="thumb" style={{ background: categoryColor(product.category) }}>
        <i className={`fa-solid ${categoryIcon(product.category)}`}></i>
      </div>
      <div className="vendor">{product.category}</div>
      <div className="title">{product.name}</div>
      <div className="stars">★★★★☆ <span style={{ color: '#5B6572' }}>({product.rating?.toFixed(1)})</span></div>
      <div className="price-row">
        <span className="price">₹{product.price.toLocaleString()}</span>
        {product.mrp > product.price && <span className="strike">₹{product.mrp.toLocaleString()}</span>}
        {off > 0 && <span className="off">{off}% off</span>}
      </div>
      {product.status === 'OUT_OF_STOCK' && <div style={{ color: '#C4331F', fontSize: 11, marginTop: 4 }}>Out of stock</div>}
    </div>
  )
}