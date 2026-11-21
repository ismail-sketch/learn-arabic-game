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

interface AppStateBody { action?: string; state?: unknown }

function config() {
  return { url: process.env.SUPABASE_URL?.replace(/\/$/, ''), key: process.env.SUPABASE_SERVICE_ROLE_KEY?.replace(/\s/g, '') }
}

function fail(response: VercelResponse, status: number, error: string): void { response.status(status).json({ error }) }

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

async function familyForToken(token: string): Promise<string | null> {
  const user = await supabase('/auth/v1/user', { headers: { Authorization: `Bearer ${token}` } })
  if (!user.ok) return null
  const data = await user.json() as { id?: string }
  if (!data.id) return null
  const member = await supabase(`/rest/v1/family_members?select=family_id&user_id=eq.${encodeURIComponent(data.id)}&active=eq.true&limit=1`)
  if (!member.ok) return null
  const rows = await member.json() as { family_id: string }[]
  return rows[0]?.family_id ?? null
}

export default async function handler(request: VercelRequest, response: VercelResponse): Promise<void> {
  const origin = request.headers?.origin
  const originValue = Array.isArray(origin) ? origin[0] : origin
  const allowedOrigin = originValue === 'https://ismail-sketch.github.io' || originValue === 'http://localhost:5173'
    ? originValue
    : 'https://learn-arabic-game.vercel.app'
  response.setHeader('Access-Control-Allow-Origin', allowedOrigin)
  response.setHeader('Vary', 'Origin')
  response.setHeader('Access-Control-Allow-Credentials', 'true')
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (request.method === 'OPTIONS') { response.status(204).json({}); return }
  if (request.method !== 'POST') { fail(response, 405, 'Only POST is available'); return }
  try {
    const token = cookie(request)
    const familyId = token ? await familyForToken(token) : null
    if (!familyId) { fail(response, 401, 'Family authentication required'); return }
    const body = (request.body ?? {}) as AppStateBody
    if (body.action === 'load') {
      const result = await supabase(`/rest/v1/family_app_state?family_id=eq.${encodeURIComponent(familyId)}&select=state,updated_at&limit=1`)
      if (!result.ok) { fail(response, 502, 'Could not load family state'); return }
      const rows = await result.json() as { state: unknown; updated_at: string }[]
      response.status(200).json(rows[0] ?? null); return
    }
    if (body.action === 'save' && body.state && typeof body.state === 'object') {
      const result = await supabase('/rest/v1/family_app_state', {
        method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({ family_id: familyId, state: body.state, updated_at: new Date().toISOString() })
      })
      if (!result.ok) { fail(response, 502, 'Could not save family state'); return }
      response.status(200).json({ ok: true }); return
    }
    fail(response, 400, 'Unknown family state action')
  } catch (error) { fail(response, 500, error instanceof Error ? error.message : 'Family state failed') }
}
