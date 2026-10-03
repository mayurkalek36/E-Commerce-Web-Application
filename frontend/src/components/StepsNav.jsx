import { Fragment } from 'react'
import { useNavigate } from 'react-router-dom'

const STEPS = [
  { key: 'cart', label: '1. Cart', path: '/cart' },
  { key: 'address', label: '2. Address', path: '/checkout' },
  { key: 'payment', label: '3. Payment', path: '/payment' },
  { key: 'confirmation', label: '4. Confirmation', path: null } // not directly re-enterable
]

export default function StepsNav({ current }) {
  const navigate = useNavigate()
  const currentIndex = STEPS.findIndex(s => s.key === current)

  return (
    <div className="steps">
      {STEPS.map((s, i) => (
        <Fragment key={s.key}>
          {i > 0 && <span className="sep">›</span>}
          {s.path ? (
            <span
              onClick={() => navigate(s.path)}
              style={{
                cursor: 'pointer',
                fontWeight: i === currentIndex ? 700 : 400,
                color: i === currentIndex ? 'var(--navy)' : undefined,
                textDecoration: i === currentIndex ? 'none' : 'underline'
              }}
            >
              {s.label}
            </span>
          ) : (
            <span style={{ fontWeight: i === currentIndex ? 700 : 400, color: i === currentIndex ? 'var(--navy)' : undefined }}>
              {s.label}
            </span>
          )}
        </Fragment>
      ))}
    </div>
  )
}