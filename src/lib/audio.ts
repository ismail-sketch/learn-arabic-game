/**
 * Аудио.
 *
 * Сначала пробуем проиграть записанный файл из манифеста ниже.
 * Если файла нет — мягко откатываемся на синтез речи (TTS).
 *
 * Чтобы добавить собственную озвучку: положите mp3 в `public/audio/`
 * и добавьте строку в `manifest`, например:
 *   'ba-name': './audio/ba-name.mp3',
 */

const manifest: Record<string, string> = {
  // Добавляйте сюда свои файлы. Имена и полный список — в public/audio/README.md.
  'greeting-ru': './audio/greeting-ru.mp3'
}

/** Есть ли для ключа готовая запись (а не временный TTS). */
export function hasRecording(key: string): boolean {
  return Boolean(manifest[key])
}

function audioUrl(key: string): string {
  return manifest[key] ?? `./audio/${key}.mp3`
}

let muted = false
let current: HTMLAudioElement | null = null
let speechRun = 0
let lastSequenceSignature = ''
let lastSequenceAt = 0

export function setMuted(value: boolean): void {
  muted = value
  if (value) stopAll()
}

export function stopAll(): void {
  speechRun += 1
  if (current) {
    current.pause()
    current = null
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

function findVoice(lang: string): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices()
  const normalized = lang.toLowerCase()
  const prefix = normalized.slice(0, 2)
  return voices.find((voice) => voice.lang.toLowerCase() === normalized) ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith(`${prefix}-`)) ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith(prefix))
}

export function playClip(key: string, fallback?: Fallback): void {
  if (muted) return
  stopAll()
  const run = speechRun
  const audio = new Audio(audioUrl(key))
  audio.preload = 'auto'
  current = audio
  let fallbackUsed = false
  const useFallback = () => {
    if (fallbackUsed || run !== speechRun) return
    fallbackUsed = true
    current = null
    if (fallback) speak(fallback.text, fallback.lang === 'ar' ? 'ar-SA' : 'ru-RU', 0.9)
  }
  audio.onended = () => { current = null }
  audio.onerror = useFallback
  audio.play().catch(useFallback)
}

function speak(text: string, lang: string, rate: number, onEnd?: () => void): void {
  if (muted) return
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  const u = new SpeechSynthesisUtterance(text)
  u.lang = lang
  u.rate = rate
  u.pitch = 1
  const match = findVoice(lang)
  if (match) u.voice = match
  if (onEnd) {
    u.onend = onEnd
    u.onerror = onEnd
  }
  window.speechSynthesis.speak(u)
}

export function speakArabic(text: string): void {
  speak(text, 'ar-SA', 0.8)
}

export function speakRussian(text: string): void {
  speak(text, 'ru-RU', 0.95)
}

export interface SpeechItem {
  text: string
  lang: 'ar' | 'ru'
  /** Ключ записи в manifest. Если файла нет, используется временный TTS. */
  key?: string
}

/**
 * Произносит несколько фраз подряд (например: «Найди букву» → «باء»).
 * Каждая следующая — по окончании предыдущей.
 */
export function speakSequence(items: SpeechItem[], rate = 0.95): void {
  if (muted) return
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  const signature = items.map((item) => `${item.key ?? ''}:${item.text}:${item.lang}`).join('|')
  const now = Date.now()
  // React StrictMode повторно монтирует экран в dev-режиме. Не ставим одну и
  // ту же автоматическую подсказку в очередь дважды.
  if (signature === lastSequenceSignature && now - lastSequenceAt < 700) return
  lastSequenceSignature = signature
  lastSequenceAt = now
  window.speechSynthesis.cancel()
  const run = ++speechRun
  let i = 0
  const next = () => {
    if (run !== speechRun || i >= items.length || muted) return
    const it = items[i++]
    const url = it.key ? audioUrl(it.key) : undefined
    if (url) {
      const audio = new Audio(url)
      audio.preload = 'auto'
      current = audio
      let fallbackUsed = false
      const useFallback = () => {
        if (fallbackUsed || run !== speechRun) return
        fallbackUsed = true
        current = null
        speak(it.text, it.lang === 'ar' ? 'ar-SA' : 'ru-RU', rate, next)
      }
      audio.onended = () => {
        current = null
        if (run === speechRun) next()
      }
      audio.onerror = useFallback
      audio.play().catch(useFallback)
      return
    }
    const u = new SpeechSynthesisUtterance(it.text)
    u.lang = it.lang === 'ar' ? 'ar-SA' : 'ru-RU'
    u.rate = rate
    u.pitch = 1
    const match = findVoice(it.lang === 'ar' ? 'ar-SA' : 'ru-RU')
    if (match) u.voice = match
    u.onend = () => { if (run === speechRun) next() }
    u.onerror = () => { if (run === speechRun) next() }
    window.speechSynthesis.speak(u)
  }
  next()
}

interface Fallback {
  text: string
  lang: 'ar' | 'ru'
}
