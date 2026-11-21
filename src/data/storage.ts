import type { AppState } from '../types'

/**
 * Контракт хранения приложения.
 *
 * Сейчас используется LocalStorageRepository. Позже экранные компоненты и
 * игровой код не изменятся: достаточно заменить реализацию на репозиторий,
 * который вызывает собственный HTTP API.
 */
export interface AppRepository {
  load(): AppState | null
  save(state: AppState): void
}

export interface RepositoryOptions {
  storageKey: string
}

export class LocalStorageRepository implements AppRepository {
  private readonly storageKey: string

  constructor({ storageKey }: RepositoryOptions) {
    this.storageKey = storageKey
  }

  load(): AppState | null {
    try {
      const raw = localStorage.getItem(this.storageKey)
      return raw ? (JSON.parse(raw) as AppState) : null
    } catch {
      return null
    }
  }

  save(state: AppState): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(state))
    } catch {
      // Недоступное или переполненное хранилище не должно ломать игру.
    }
  }
}

/**
 * Заготовка контракта будущего собственного сервера.
 * Она намеренно не используется до появления API, чтобы приложение пока
 * работало автономно и без зависимости от облачных сервисов.
 */
export interface RemoteRepository extends AppRepository {
  sync(): Promise<void>
}

export const appRepository: AppRepository = new LocalStorageRepository({
  storageKey: 'sad-bukv:v2'
})

/** Локальное хранилище, изолированное идентификатором семьи. */
export function familyRepository(familyId: string | null): AppRepository {
  if (!familyId) return new LocalStorageRepository({ storageKey: 'sad-bukv:anonymous' })
  const safeId = familyId.replace(/[^a-zA-Z0-9_-]/g, '_')
  return new LocalStorageRepository({ storageKey: `sad-bukv:family:${safeId}` })
}
