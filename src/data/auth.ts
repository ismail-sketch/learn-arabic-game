export type AuthRole = 'parent' | 'admin'

export interface AuthSession { authenticated: boolean; role?: AuthRole; familyId?: string }

async function call(body: Record<string, string>): Promise<Response> {
  return fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
}

export const authRepository = {
  async session(): Promise<AuthSession> {
    const response = await call({ action: 'session' })
    return response.ok ? await response.json() as AuthSession : { authenticated: false }
  },
  async login(email: string, password: string): Promise<void> {
    const response = await call({ action: 'login', email, password })
    if (!response.ok) throw new Error((await response.json() as { error?: string }).error ?? 'Login failed')
  },
  async requestAccess(name: string, email: string): Promise<void> {
    const response = await call({ action: 'request', name, email })
    if (!response.ok) throw new Error((await response.json() as { error?: string }).error ?? 'Request failed')
  },
  async logout(): Promise<void> { await call({ action: 'logout' }) }
}
