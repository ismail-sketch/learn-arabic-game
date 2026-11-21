import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { authRepository, type AuthSession } from '../data/auth'

interface AuthContextValue {
  session: AuthSession | null
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)

  useEffect(() => {
    authRepository.session().then(setSession).catch(() => setSession({ authenticated: false }))
  }, [])

  async function logout() {
    await authRepository.logout()
    setSession({ authenticated: false })
  }

  return <AuthContext.Provider value={{ session, logout }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
