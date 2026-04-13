/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react'
import { STORAGE_KEYS } from '../constants'

const AuthContext = createContext(null)

const emptyAuth = { token: '', user: null }

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.auth)
      return saved ? JSON.parse(saved) : emptyAuth
    } catch {
      localStorage.removeItem(STORAGE_KEYS.auth)
      return emptyAuth
    }
  })

  const login = (token, user) => {
    const next = { token, user }
    setAuth(next)
    localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(next))
  }

  const logout = () => {
    setAuth(emptyAuth)
    localStorage.removeItem(STORAGE_KEYS.auth)
  }

  const value = useMemo(() => ({ ...auth, login, logout }), [auth])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
