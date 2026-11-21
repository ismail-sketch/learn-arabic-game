interface VercelRequest {
  method?: string
}

interface VercelResponse {
  status(code: number): VercelResponse
  setHeader(name: string, value: string): void
  json(body: unknown): void
}

interface SupabaseWord {
  id: string
  arabic: string
  meaning_ru: string
  category: string
  image_url: string | null
  audio_url: string | null
}

function sendError(response: VercelResponse, status: number, message: string): void {
  response.status(status).json({ error: message })
}

export default async function handler(request: VercelRequest, response: VercelResponse): Promise<void> {
  try {
    response.setHeader('Access-Control-Allow-Origin', '*')
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (request.method === 'OPTIONS') {
      response.status(204).json({})
      return
    }
    if (request.method !== 'GET') {
      sendError(response, 405, 'Only GET is available in the first API version')
      return
    }

    const baseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '')
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!baseUrl || !serviceKey) {
      sendError(response, 503, 'Supabase API is not configured yet')
      return
    }

    const query = new URLSearchParams({
      select: 'id,arabic,meaning_ru,category,image_url,audio_url',
      scope: 'eq.published',
      status: 'eq.published',
      order: 'updated_at.desc'
    })
    const result = await fetch(`${baseUrl}/rest/v1/learning_words?${query}`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
    })

    if (!result.ok) {
      const detail = (await result.text()).slice(0, 300)
      sendError(response, 502, `Supabase request failed: ${detail}`)
      return
    }

    const rows = (await result.json()) as SupabaseWord[]
    response.status(200).json(rows.map((word) => ({
      id: word.id,
      arabic: word.arabic,
      meaningRu: word.meaning_ru,
      category: word.category,
      imageUrl: word.image_url,
      audioUrl: word.audio_url
    })))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error'
    sendError(response, 500, `Words API failed: ${message}`)
  }
}
