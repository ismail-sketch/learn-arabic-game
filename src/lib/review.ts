import { letters, type Letter } from '../data/letters'
import type { LetterProgress, Progress } from '../types'

/** Первый интервал до повторения: 4 часа */
export const FIRST_INTERVAL = 4 * 60 * 60 * 1000
/** Максимальный интервал: 7 дней */
export const MAX_INTERVAL = 7 * 24 * 60 * 60 * 1000

export function intervalOf(p: LetterProgress | undefined): number {
  return p?.interval ?? FIRST_INTERVAL
}

/** Пора ли повторять букву */
export function isDue(p: LetterProgress | undefined): boolean {
  if (!p?.learned) return false
  const last = p.lastReview ?? 0
  return Date.now() >= last + intervalOf(p)
}

/** Буквы, которые пора повторить */
export function dueLetters(progress: Progress): Letter[] {
  return letters.filter((l) => isDue(progress[l.id]))
}

/** Все выученные буквы */
export function learnedLetters(progress: Progress): Letter[] {
  return letters.filter((l) => progress[l.id]?.learned)
}

export function nextInterval(current: number | undefined, success: boolean): number {
  const base = current ?? FIRST_INTERVAL
  return success ? Math.min(base * 2, MAX_INTERVAL) : FIRST_INTERVAL
}