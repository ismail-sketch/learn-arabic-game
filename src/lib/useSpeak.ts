import { useEffect, useRef } from 'react'
import { speakSequence, type SpeechItem } from './audio'


/**
 * Произносит подсказку один раз, когда меняется `key`
 * (например, при переходе к новому шагу). Переживает двойной вызов
 * эффекта в React StrictMode.
 */
export function useSpeak(key: string, items: SpeechItem[]): void {
  const last = useRef<string>('')
  useEffect(() => {
    if (last.current === key) return
    last.current = key
    if (items.length) speakSequence(items)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
}
