import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { authRepository, type AuthSession } from '../data/auth'

interface AuthContextValue {
  session: AuthSession | null
  refresh: () => Promise<AuthSession>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)

  async function refresh(): Promise<AuthSession> {
    const next = await authRepository.session()
    setSession(next)
    return next
  }

  useEffect(() => {
    refresh().catch(() => setSession({ authenticated: false }))
  }, [])

  async function logout() {
    await authRepository.logout()
    setSession({ authenticated: false })
  }

  return <AuthContext.Provider value={{ session, refresh, logout }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
