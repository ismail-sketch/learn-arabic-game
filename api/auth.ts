interface VercelRequest {
  method?: string
  body?: unknown
  headers?: Record<string, string | string[] | undefined>
}

interface VercelResponse {
  status(code: number): VercelResponse
  setHeader(name: string, value: string): void
  json(body: unknown): void
}

interface AuthBody { action?: string; email?: string; password?: string; name?: string }

function config() {
  return {
    url: process.env.SUPABASE_URL?.replace(/\/$/, ''),
    key: process.env.SUPABASE_SERVICE_ROLE_KEY?.replace(/\s/g, '')
  }
}

function fail(response: VercelResponse, status: number, error: string): void {
  response.status(status).json({ error })
}

function cookie(request: VercelRequest): string | null {
  const value = request.headers?.cookie
  const text = Array.isArray(value) ? value.join(';') : value
  return text?.match(/sad_auth=([^;]+)/)?.[1] ?? null
}

async function supabase(path: string, init: RequestInit = {}): Promise<Response> {
  const { url, key } = config()
  if (!url || !key) throw new Error('Supabase API is not configured yet')
  return fetch(`${url}${path}`, {
    ...init,
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) }
  })
}

async function currentUser(token: string): Promise<{ id: string; email?: string } | null> {
  const result = await supabase('/auth/v1/user', { headers: { Authorization: `Bearer ${token}` } })
  return result.ok ? (await result.json() as { id: string; email?: string }) : null
}

async function roleOf(token: string): Promise<{ id: string; role: string } | null> {
  const user = await currentUser(token)
  if (!user) return null
  const result = await supabase(`/rest/v1/family_members?select=family_id,role&user_id=eq.${encodeURIComponent(user.id)}&limit=1`)
  if (!result.ok) return null
  const rows = await result.json() as { family_id: string; role: string }[]
  return rows[0] ? { id: rows[0].family_id, role: rows[0].role } : null
}

export default async function handler(request: VercelRequest, response: VercelResponse): Promise<void> {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (request.method === 'OPTIONS') { response.status(204).json({}); return }
  if (request.method !== 'POST') { fail(response, 405, 'Only POST is available'); return }

  try {
    const body = (request.body ?? {}) as AuthBody
    if (body.action === 'request') {
      if (!body.email || !body.name) { fail(response, 400, 'Name and email are required'); return }
      const result = await supabase('/rest/v1/registration_requests', {
        method: 'POST', headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ email: body.email.trim().toLowerCase(), name: body.name.trim() })
      })
      if (!result.ok) { fail(response, 400, 'This email may already have a request'); return }
      response.status(202).json({ ok: true, status: 'pending' }); return
    }
    if (body.action === 'login') {
      if (!body.email || !body.password) { fail(response, 400, 'Email and password are required'); return }
      const result = await supabase('/auth/v1/token?grant_type=password', {
        method: 'POST', body: JSON.stringify({ email: body.email.trim().toLowerCase(), password: body.password })
      })
      if (!result.ok) { fail(response, 401, 'Invalid login or account is not approved'); return }
      const session = await result.json() as { access_token: string; expires_in: number }
      const role = await roleOf(session.access_token)
      if (!role) { fail(response, 403, 'Account is waiting for approval'); return }
      response.setHeader('Set-Cookie', `sad_auth=${session.access_token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${session.expires_in}`)
      response.status(200).json({ ok: true, role: role.role }); return
    }
    if (body.action === 'session') {
      const token = cookie(request)
      const role = token ? await roleOf(token) : null
      response.status(200).json(role ? { authenticated: true, role: role.role, familyId: role.id } : { authenticated: false }); return
    }
    if (body.action === 'logout') {
      response.setHeader('Set-Cookie', 'sad_auth=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0')
      response.status(200).json({ ok: true }); return
    }
    fail(response, 400, 'Unknown auth action')
  } catch (error) {
    fail(response, 500, error instanceof Error ? error.message : 'Authentication failed')
  }
}
