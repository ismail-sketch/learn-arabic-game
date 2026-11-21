import type { AppState } from '../types'

interface RemoteState { state: AppState; updated_at: string }

async function call(body: Record<string, unknown>): Promise<Response> {
  return fetch('/api/family-state', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  })
}

export async function loadFamilyState(): Promise<AppState | null> {
  const response = await call({ action: 'load' })
  if (!response.ok) throw new Error('Не удалось загрузить данные семьи')
  const data = await response.json() as RemoteState | null
  return data?.state ?? null
}

export async function saveFamilyState(state: AppState): Promise<void> {
  const response = await call({ action: 'save', state })
  if (!response.ok) throw new Error('Не удалось синхронизировать данные семьи')
}
