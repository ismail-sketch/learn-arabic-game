import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  useRef,
  type ReactNode
} from 'react'
import type { AppState, CustomWord, Progress, Profile, Settings, Track } from '../types'
import { FIRST_INTERVAL, nextInterval } from '../lib/review'
import { familyRepository } from '../data/storage'
import { useAuth } from './AuthState'
import { loadFamilyState, saveFamilyState, loadSyncMeta, saveSyncMeta } from '../data/familySync'

const defaultSettings: Settings = {
  uiLang: 'ru',
  sunFace: false,
  muted: false
}

const initialState: AppState = {
  profiles: [],
  activeProfileId: null,
  progressByProfile: {},
  customWords: [],
  settings: defaultSettings
}

type Action =
  | { type: 'ADD_PROFILE'; profile: Profile }
  | { type: 'REMOVE_PROFILE'; id: string }
  | { type: 'SET_ACTIVE'; id: string | null }
  | { type: 'UPDATE_SETTINGS'; patch: Partial<Settings> }
  | { type: 'COMPLETE_LESSON'; profileId: string; letterId: string }
  | { type: 'RESET_PROGRESS'; profileId: string }
  | { type: 'REVIEW_BATCH'; profileId: string; results: Record<string, boolean> }
  | { type: 'ADD_CUSTOM_WORD'; word: CustomWord }
  | { type: 'REMOVE_CUSTOM_WORD'; id: string }
  | { type: 'LOAD_STATE'; state: AppState }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_PROFILE':
      return { ...state, profiles: [...state.profiles, action.profile] }
    case 'REMOVE_PROFILE': {
      const progressByProfile = { ...state.progressByProfile }
      delete progressByProfile[action.id]
      const profiles = state.profiles.filter((p) => p.id !== action.id)
      const activeProfileId =
        state.activeProfileId === action.id ? null : state.activeProfileId
      return { ...state, profiles, progressByProfile, activeProfileId }
    }
    case 'SET_ACTIVE':
      return { ...state, activeProfileId: action.id }
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.patch } }
    case 'COMPLETE_LESSON': {
      const current: Progress = state.progressByProfile[action.profileId] ?? {}
      const existing = current[action.letterId]
      const next: Progress = {
        ...current,
        [action.letterId]: {
          learned: true,
          stars: Math.max(1, existing?.stars ?? 0),
          lastReview: Date.now(),
          interval: FIRST_INTERVAL
        }
      }
      return {
        ...state,
        progressByProfile: {
          ...state.progressByProfile,
          [action.profileId]: next
        }
      }
    }
    case 'RESET_PROGRESS':
      return {
        ...state,
        progressByProfile: {
          ...state.progressByProfile,
          [action.profileId]: {}
        }
      }
    case 'REVIEW_BATCH': {
      const current: Progress = state.progressByProfile[action.profileId] ?? {}
      const now = Date.now()
      const next: Progress = { ...current }
      for (const [id, ok] of Object.entries(action.results)) {
        const p = next[id]
        if (!p) continue
        next[id] = { ...p, lastReview: now, interval: nextInterval(p.interval, ok) }
      }
      return {
        ...state,
        progressByProfile: {
          ...state.progressByProfile,
          [action.profileId]: next
        }
      }
    }
    case 'ADD_CUSTOM_WORD':
      return { ...state, customWords: [...state.customWords, action.word] }
    case 'REMOVE_CUSTOM_WORD':
      return {
        ...state,
        customWords: state.customWords.filter((w) => w.id !== action.id)
      }
    case 'LOAD_STATE':
      return action.state
    default:
      return state
  }
}

function normalizeState(parsed: AppState | null): AppState {
  if (parsed) {
    return {
      profiles: parsed.profiles ?? [],
      activeProfileId: parsed.activeProfileId ?? null,
      progressByProfile: parsed.progressByProfile ?? {},
      customWords: parsed.customWords ?? [],
      settings: { ...defaultSettings, ...(parsed.settings ?? {}) }
    }
  }
  return initialState
}

interface Ctx {
  state: AppState
  addProfile: (name: string, track: Track, avatar: string) => string
  removeProfile: (id: string) => void
  setActive: (id: string | null) => void
  updateSettings: (patch: Partial<Settings>) => void
  completeLesson: (letterId: string) => void
  resetProgress: () => void
  reviewBatch: (results: Record<string, boolean>) => void
  addCustomWord: (word: string, meaning: string, emoji: string) => void
  removeCustomWord: (id: string) => void
}

const AppCtx = createContext<Ctx | null>(null)

function newId(prefix: string): string {
  return prefix + Math.random().toString(36).slice(2, 10)
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const familyId = session?.authenticated ? session.familyId ?? null : null
  const [state, dispatch] = useReducer(reducer, initialState)
  const [ready, setReady] = useState(false)
  const [loadedFamilyId, setLoadedFamilyId] = useState<string | null>(null)
  const [remoteReady, setRemoteReady] = useState(false)
  const [remoteAvailable, setRemoteAvailable] = useState(false)
  const saveQueue = useRef(Promise.resolve())

  useEffect(() => {
    if (!ready || !remoteReady || !familyId || loadedFamilyId !== familyId) return
    familyRepository(familyId).save(state)
    saveSyncMeta(familyId, { ...loadSyncMeta(familyId), localChangedAt: new Date().toISOString() })
    // Без подтверждённой связи с сервером не отправляем состояние, чтобы
    // устаревшая локальная копия не затёрла более свежие серверные данные.
    if (!remoteAvailable) return
    // Изменения прогресса могут происходить быстро. Последовательная очередь
    // не даёт старому HTTP-запросу завершиться после нового и затереть его.
    saveQueue.current = saveQueue.current
      .catch(() => undefined)
      .then(async () => {
        await saveFamilyState(state)
        saveSyncMeta(familyId, { ...loadSyncMeta(familyId), lastSyncedAt: new Date().toISOString() })
      })
  }, [familyId, loadedFamilyId, ready, remoteAvailable, remoteReady, state])

  useEffect(() => {
    let cancelled = false
    async function loadFamily() {
      setRemoteReady(false)
      setRemoteAvailable(false)
      const local = familyId ? familyRepository(familyId).load() : null
      let next = local ? normalizeState(local) : initialState
      if (familyId) {
        try {
          const remote = await loadFamilyState()
          const meta = loadSyncMeta(familyId)
          if (remote) {
            const localChanged = meta?.localChangedAt ? Date.parse(meta.localChangedAt) : NaN
            const remoteChanged = Date.parse(remote.updatedAt)
            const localIsNewer = local && Number.isFinite(localChanged) && localChanged > remoteChanged
            if (localIsNewer) {
              // Локальные изменения появились после последней синхронизации,
              // поэтому отправляем их, а серверный снимок уже устарел.
              next = normalizeState(local)
              await saveFamilyState(next)
              saveSyncMeta(familyId, { localChangedAt: new Date().toISOString(), lastSyncedAt: new Date().toISOString() })
            } else {
              // Серверный снимок свежее либо локальной копии нет. Он важнее:
              // так телефон не «застревает» на старых локальных данных.
              next = normalizeState(remote.state)
              familyRepository(familyId).save(next)
              saveSyncMeta(familyId, { localChangedAt: remote.updatedAt, lastSyncedAt: remote.updatedAt })
            }
          } else if (local) {
            await saveFamilyState(next)
            saveSyncMeta(familyId, { localChangedAt: new Date().toISOString(), lastSyncedAt: new Date().toISOString() })
          }
          if (!cancelled) setRemoteAvailable(true)
        } catch { /* Локальная копия остаётся доступной офлайн. */ }
      }
      if (!cancelled) {
        dispatch({ type: 'LOAD_STATE', state: next })
        setReady(Boolean(familyId))
        setLoadedFamilyId(familyId)
        setRemoteReady(Boolean(familyId))
      }
    }
    void loadFamily()
    return () => { cancelled = true }
  }, [familyId])

  const value = useMemo<Ctx>(
    () => ({
      state,
      addProfile: (name, track, avatar) => {
        const id = newId('p')
        dispatch({ type: 'ADD_PROFILE', profile: { id, name, track, avatar } })
        return id
      },
      removeProfile: (id) => dispatch({ type: 'REMOVE_PROFILE', id }),
      setActive: (id) => dispatch({ type: 'SET_ACTIVE', id }),
      updateSettings: (patch) => dispatch({ type: 'UPDATE_SETTINGS', patch }),
      completeLesson: (letterId) => {
        if (state.activeProfileId) {
          dispatch({
            type: 'COMPLETE_LESSON',
            profileId: state.activeProfileId,
            letterId
          })
        }
      },
      resetProgress: () => {
        if (state.activeProfileId) {
          dispatch({ type: 'RESET_PROGRESS', profileId: state.activeProfileId })
        }
      },
      reviewBatch: (results) => {
        if (state.activeProfileId) {
          dispatch({
            type: 'REVIEW_BATCH',
            profileId: state.activeProfileId,
            results
          })
        }
      },
      addCustomWord: (word, meaning, emoji) =>
        dispatch({
          type: 'ADD_CUSTOM_WORD',
          word: { id: newId('w'), word, meaning, emoji }
        }),
      removeCustomWord: (id) => dispatch({ type: 'REMOVE_CUSTOM_WORD', id })
    }),
    [state]
  )

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export function useApp(): Ctx {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export function useActiveProfile(): Profile | null {
  const { state } = useApp()
  return state.profiles.find((p) => p.id === state.activeProfileId) ?? null
}
