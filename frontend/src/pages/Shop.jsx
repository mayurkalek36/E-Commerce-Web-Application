import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'
import api from '../api'
import { CATEGORIES } from '../data/categoryMeta'
import { useLanguage } from '../context/LanguageContext'

const CHIPS = ['All', ...CATEGORIES]

export default function Shop() {
  const [products, setProducts] = useState([])
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    setLoading(true)
    const params = category !== 'All' ? { category } : {}
    api.get('/products', { params }).then(res => setProducts(res.data)).finally(() => setLoading(false))
  }, [category])

  return (
    <div>
      <Navbar />
      <div className="catbar">
        {CHIPS.map(c => (
          <span key={c} className={c === category ? 'active' : ''} onClick={() => setCategory(c)}>
            {c === 'All' ? t('all') : c}
          </span>
        ))}
      </div>
      <div className="hero">
        <div style={{ color: '#FF7A1A', fontWeight: 700, fontSize: 12.5, marginBottom: 6 }}>{t('heroEyebrow')}</div>
        <h1>{t('heroTitle1')}<br />{t('heroTitle2')}</h1>
        <p>{t('heroSubtitle')}</p>
      </div>
      <div className="section-title"><h2>{category === 'All' ? t('allProducts') : category}</h2></div>
      {loading ? (
        <div className="empty-state">{t('loadingProducts')}</div>
      ) : products.length === 0 ? (
        <div className="empty-state">{t('noProducts')}</div>
      ) : (
        <div className="grid">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}