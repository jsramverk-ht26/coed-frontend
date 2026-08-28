/**
 * AuthContext — global auth-state och token-hantering
 * US-102: Logga in och ut — auth-kontext / state management
 * US-102: Protected route-wrapper (används av ProtectedRoute)
 */

import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

const TOKEN_KEY = 'coed_token'
const USER_KEY  = 'coed_user'

export function AuthProvider({ children }) {
  const [token, setToken]   = useState(() => localStorage.getItem(TOKEN_KEY) || null)
  const [user, setUser]     = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  /** US-101 / US-102: Spara inloggningsstatus efter register eller login */
  const login = useCallback((userData, jwt) => {
    setToken(jwt)
    setUser(userData)
    localStorage.setItem(TOKEN_KEY, jwt)
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
  }, [])

  /** US-102: Logga ut — rensa session och token */
  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }, [])

  /** US-103: Uppdatera user-objektet lokalt efter profiländring */
  const updateUser = useCallback((updated) => {
    setUser(updated)
    localStorage.setItem(USER_KEY, JSON.stringify(updated))
  }, [])

  return (
    <AuthContext.Provider value={{ token, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

/** Hook för att komma åt auth-kontexten */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
