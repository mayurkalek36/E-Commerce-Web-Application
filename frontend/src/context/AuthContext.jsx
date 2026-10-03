import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('shopstack_user')
    return saved ? JSON.parse(saved) : null
  })

  function login(userData) {
    setUser(userData)
    localStorage.setItem('shopstack_user', JSON.stringify(userData))
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('shopstack_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
