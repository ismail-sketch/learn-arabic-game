const VERCEL_API_ORIGIN = 'https://learn-arabic-game.vercel.app'

export function apiUrl(path: string): string {
  return window.location.hostname.endsWith('github.io')
    ? `${VERCEL_API_ORIGIN}${path}`
    : path
}

export const apiFetchOptions: RequestInit = { credentials: 'include' }
