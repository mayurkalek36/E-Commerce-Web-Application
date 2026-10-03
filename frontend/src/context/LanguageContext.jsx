import { createContext, useContext, useState } from 'react'
import { translations } from '../i18n/translations'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('shopstack_lang') || 'en')

  function changeLang(code) {
    setLang(code)
    localStorage.setItem('shopstack_lang', code)
  }

  function t(key) {
    return translations[lang]?.[key] ?? translations.en[key] ?? key
  }

  return (
    <LanguageContext.Provider value={{ lang, changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}