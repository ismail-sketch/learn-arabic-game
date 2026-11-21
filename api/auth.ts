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

interface AuthBody { action?: string; email?: string; password?: string; name?: string; requestId?: string; active?: boolean }

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
  const result = await supabase(`/rest/v1/family_members?select=family_id,role&user_id=eq.${encodeURIComponent(user.id)}&active=eq.true&limit=1`)
  if (!result.ok) return null
  const rows = await result.json() as { family_id: string; role: string }[]
  return rows[0] ? { id: rows[0].family_id, role: rows[0].role } : null
}

async function requireAdmin(request: VercelRequest): Promise<{ userId: string; token: string } | null> {
  const token = cookie(request)
  if (!token) return null
  const user = await currentUser(token)
  const role = await roleOf(token)
  return user && role?.role === 'admin' ? { userId: user.id, token } : null
}

async function requestById(id: string): Promise<{ id: string; name: string; email: string; status: string } | null> {
  const result = await supabase(`/rest/v1/registration_requests?id=eq.${encodeURIComponent(id)}&select=id,name,email,status&limit=1`)
  if (!result.ok) return null
  const rows = await result.json() as { id: string; name: string; email: string; status: string }[]
  return rows[0] ?? null
}

async function authUserByEmail(email: string): Promise<{ id: string } | null> {
  const result = await supabase(`/auth/v1/admin/users? page=1&per_page=1000`.replace('? ', '?'), { headers: { Accept: 'application/json' } })
  if (!result.ok) return null
  const data = await result.json() as { users?: { id: string; email?: string }[] }
  return data.users?.find(user => user.email?.toLowerCase() === email.toLowerCase()) ?? null
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
    if (body.action === 'requests') {
      if (!await requireAdmin(request)) { fail(response, 403, 'Admin access required'); return }
      const result = await supabase('/rest/v1/registration_requests?select=id,name,email,status,created_at,reviewed_at&order=created_at.desc')
      if (!result.ok) { fail(response, 502, 'Could not load registration requests'); return }
      response.status(200).json(await result.json()); return
    }
    if (body.action === 'approve' || body.action === 'reject') {
      const admin = await requireAdmin(request)
      if (!admin || !body.requestId) { fail(response, 403, 'Admin access required'); return }
      const item = await requestById(body.requestId)
      if (!item) { fail(response, 404, 'Registration request not found'); return }
      if (item.status !== 'pending') { fail(response, 409, 'This request was already reviewed'); return }
      if (body.action === 'reject') {
        const result = await supabase(`/rest/v1/registration_requests?id=eq.${encodeURIComponent(item.id)}`, {
          method: 'PATCH', headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({ status: 'rejected', reviewed_by: admin.userId, reviewed_at: new Date().toISOString() })
        })
        if (!result.ok) { fail(response, 502, 'Could not reject request'); return }
        response.status(200).json({ ok: true, status: 'rejected' }); return
      }
      const invite = await supabase('/auth/v1/invite', { method: 'POST', body: JSON.stringify({ email: item.email }) })
      if (!invite.ok) { fail(response, 502, 'Could not send invitation email'); return }
      const invited = await invite.json() as { id: string }
      const family = await supabase('/rest/v1/families', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ name: item.name }) })
      if (!family.ok) { fail(response, 502, 'Could not create family'); return }
      const familyRows = await family.json() as { id: string }[]
      const familyId = familyRows[0]?.id
      if (!familyId) { fail(response, 502, 'Family was not created'); return }
      const member = await supabase('/rest/v1/family_members', {
        method: 'POST', headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ family_id: familyId, user_id: invited.id, role: 'parent' })
      })
      if (!member.ok) { fail(response, 502, 'Could not link invited user to family'); return }
      const updated = await supabase(`/rest/v1/registration_requests?id=eq.${encodeURIComponent(item.id)}`, {
        method: 'PATCH', headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ status: 'approved', reviewed_by: admin.userId, reviewed_at: new Date().toISOString() })
      })
      if (!updated.ok) { fail(response, 502, 'Family created but request status was not updated'); return }
      response.status(200).json({ ok: true, status: 'approved' }); return
    }
    if (body.action === 'resend-invite') {
      if (!await requireAdmin(request) || !body.requestId) { fail(response, 403, 'Admin access required'); return }
      const item = await requestById(body.requestId)
      if (!item || item.status !== 'approved') { fail(response, 409, 'Only an approved request can receive an invitation'); return }
      const user = await authUserByEmail(item.email)
      if (!user) { fail(response, 404, 'Invited user not found'); return }
      // Пользователь уже создан первым приглашением. Повторный invite даёт
      // email_exists, поэтому отправляем recovery-письмо для установки/смены
      // пароля существующего пользователя.
      const invite = await supabase('/auth/v1/recover', {
        method: 'POST',
        body: JSON.stringify({
          email: item.email,
          redirect_to: process.env.APP_URL ?? 'https://learn-arabic-game.vercel.app/'
        })
      })
      if (!invite.ok) {
        const detail = (await invite.text()).slice(0, 240)
        fail(response, 502, `Could not send password setup email: ${detail}`); return
      }
      response.status(200).json({ ok: true }); return
    }
    if (body.action === 'set-family-active') {
      if (!await requireAdmin(request) || !body.requestId || typeof body.active !== 'boolean') { fail(response, 403, 'Admin access required'); return }
      const item = await requestById(body.requestId)
      if (!item || item.status !== 'approved') { fail(response, 404, 'Approved request not found'); return }
      const user = await authUserByEmail(item.email)
      if (!user) { fail(response, 404, 'Invited user not found'); return }
      const result = await supabase(`/rest/v1/family_members?user_id=eq.${encodeURIComponent(user.id)}&role=eq.parent`, {
        method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ active: body.active })
      })
      if (!result.ok) { fail(response, 502, 'Could not change family access'); return }
      response.status(200).json({ ok: true, active: body.active }); return
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
