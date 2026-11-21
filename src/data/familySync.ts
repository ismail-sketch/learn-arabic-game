import type { AppState } from '../types'
import { apiFetchOptions, apiUrl } from './api'

interface RemoteState { state: AppState; updated_at: string }

export interface FamilySyncMeta {
  localChangedAt?: string
  lastSyncedAt?: string
}

async function call(body: Record<string, unknown>): Promise<Response> {
  return fetch(apiUrl('/api/family-state'), {
    ...apiFetchOptions,
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  })
}

export async function loadFamilyState(): Promise<{ state: AppState; updatedAt: string } | null> {
  const response = await call({ action: 'load' })
  if (!response.ok) throw new Error('Не удалось загрузить данные семьи')
  const data = await response.json() as RemoteState | null
  return data ? { state: data.state, updatedAt: data.updated_at } : null
}

export async function saveFamilyState(state: AppState): Promise<void> {
  const response = await call({ action: 'save', state })
  if (!response.ok) throw new Error('Не удалось синхронизировать данные семьи')
}

function safeId(familyId: string): string {
  return familyId.replace(/[^a-zA-Z0-9_-]/g, '_')
}

function metaKey(familyId: string): string {
  return `sad-bukv:family:${safeId(familyId)}:sync`
}

export function loadSyncMeta(familyId: string): FamilySyncMeta | null {
  try {
    const raw = localStorage.getItem(metaKey(familyId))
    return raw ? JSON.parse(raw) as FamilySyncMeta : null
  } catch { return null }
}

export function saveSyncMeta(familyId: string, meta: FamilySyncMeta): void {
  try {
    localStorage.setItem(metaKey(familyId), JSON.stringify(meta))
  } catch { /* Недоступное хранилище не должно ломать синхронизацию. */ }
}
