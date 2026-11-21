import { apiFetchOptions, apiUrl } from './api'

export type AuthRole = 'parent' | 'admin'

export interface AuthSession { authenticated: boolean; role?: AuthRole; familyId?: string }
export interface RegistrationRequest { id: string; name: string; email: string; status: 'pending' | 'approved' | 'rejected'; created_at: string }

async function call(body: Record<string, string>): Promise<Response> {
  return fetch(apiUrl('/api/auth'), { ...apiFetchOptions, method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
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
  async setPassword(accessToken: string, password: string): Promise<void> {
    const response = await call({ action: 'set-password', accessToken, password })
    if (!response.ok) throw new Error((await response.json() as { error?: string }).error ?? 'Could not set password')
  },
  async requestAccess(name: string, email: string): Promise<void> {
    const response = await call({ action: 'request', name, email })
    if (!response.ok) throw new Error((await response.json() as { error?: string }).error ?? 'Request failed')
  },
  async logout(): Promise<void> { await call({ action: 'logout' }) },
  async requests(): Promise<RegistrationRequest[]> {
    const response = await call({ action: 'requests' })
    if (!response.ok) throw new Error((await response.json() as { error?: string }).error ?? 'Could not load requests')
    return await response.json() as RegistrationRequest[]
  },
  async review(requestId: string, action: 'approve' | 'reject'): Promise<void> {
    const response = await call({ action, requestId })
    if (!response.ok) throw new Error((await response.json() as { error?: string }).error ?? 'Could not review request')
  },
  async resendInvite(requestId: string): Promise<void> {
    const response = await call({ action: 'resend-invite', requestId })
    if (!response.ok) throw new Error((await response.json() as { error?: string }).error ?? 'Could not send password setup email')
  },
  async setFamilyActive(requestId: string, active: boolean): Promise<void> {
    const response = await fetch(apiUrl('/api/auth'), { ...apiFetchOptions, method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'set-family-active', requestId, active }) })
    if (!response.ok) throw new Error((await response.json() as { error?: string }).error ?? 'Could not change family access')
  },
  async deleteFamily(requestId: string): Promise<void> {
    const response = await call({ action: 'delete-family', requestId })
    if (!response.ok) throw new Error((await response.json() as { error?: string }).error ?? 'Could not delete family')
  }
}
