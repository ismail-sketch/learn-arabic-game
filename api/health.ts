interface VercelResponse {
  status(code: number): VercelResponse
  json(body: unknown): void
}

export default function handler(_request: unknown, response: VercelResponse): void {
  response.status(200).json({
    ok: true,
    service: 'learn-arabic-game-api',
    version: '1'
  })
}
