export type UiLang = 'ru' | 'ar'

/** Возрастная дорожка — определяет сложность и размер интерфейса */
export type Track = 'sprout' | 'flower' | 'tree'

export interface Profile {
  id: string
  name: string
  track: Track
  avatar: string
}

export interface LetterProgress {
  learned: boolean
  stars: number
  /** Метка времени последнего успешного повторения (для интервального закрепления) */
  lastReview?: number
  /** Интервал до следующего повторения, мс */
  interval?: number
}

export type Progress = Record<string, LetterProgress>

/** Своё слово, добавленное родителем */
export interface CustomWord {
  id: string
  /** Арабский текст слова */
  word: string
  /** Русский перевод */
  meaning: string
  /** Картинка-эмодзи */
  emoji: string
}

export interface Settings {
  uiLang: UiLang
  /** Показывать у Солнышка лицо (по умолчанию выключено) */
  sunFace: boolean
  muted: boolean
}

export interface AppState {
  profiles: Profile[]
  activeProfileId: string | null
  progressByProfile: Record<string, Progress>
  customWords: CustomWord[]
  settings: Settings
}