import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { LANGUAGES } from '../i18n/translations'

export default function LanguageSwitcher() {
  const { lang, changeLang } = useLanguage()
  const [open, setOpen] = useState(false)
  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0]

  return (
    <div style={{ position: 'relative' }}>
      <div className="item" onClick={() => setOpen(o => !o)}>
        <small><i className="fa-solid fa-globe"></i></small>
        <strong>{current.label}</strong>
      </div>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 998 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', top: '110%', right: 0, zIndex: 999,
            background: '#fff', color: '#151A21', minWidth: 140, borderRadius: 8,
            boxShadow: '0 10px 30px rgba(0,0,0,.25)', padding: 6
          }}>
            {LANGUAGES.map(l => (
              <div
                key={l.code}
                onClick={() => { changeLang(l.code); setOpen(false) }}
                style={{
                  padding: '9px 12px', borderRadius: 5, fontSize: 13, cursor: 'pointer',
                  background: l.code === lang ? '#FFF1E4' : 'transparent',
                  fontWeight: l.code === lang ? 700 : 400
                }}
              >
                {l.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}