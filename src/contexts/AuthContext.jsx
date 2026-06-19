import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'
import { authService } from '../services/authService'
import { ROLES } from '../utils/constants'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profil, setProfil] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Safety net: if Firebase never calls back (bad config, network failure),
    // unblock the app after 6 s so the user reaches /login instead of a frozen spinner.
    const timeout = setTimeout(() => {
      console.error('[AuthContext] onAuthStateChanged timed out — check Firebase config and network.')
      setLoading(false)
    }, 6000)

    const unsub = onAuthStateChanged(
      auth,
      async (fbUser) => {
        clearTimeout(timeout)
        if (fbUser) {
          setUser(fbUser)
          setLoading(false) // unblock routes immediately; profile loads in background
          try {
            const p = await authService.getProfil(fbUser.uid)
            setProfil(p)
          } catch {
            setProfil(null)
          }
        } else {
          setUser(null)
          setProfil(null)
          setLoading(false)
        }
      },
      (err) => {
        clearTimeout(timeout)
        console.error('[AuthContext] onAuthStateChanged error:', err.code, err.message)
        setLoading(false)
      },
    )
    return () => {
      clearTimeout(timeout)
      unsub()
    }
  }, [])

  const login = async (creds) => authService.login(creds)
  const register = async (data) => {
    return authService.register(data)
  }
  const logout = async () => authService.logout()

  const role = profil?.role || ROLES.USER
  const isAdmin = role === ROLES.ADMIN

  const value = { user, profil, role, isAdmin, loading, login, register, logout }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>')
  return ctx
}
