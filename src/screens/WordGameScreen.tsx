import { useMemo, useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { letters } from '../data/letters'
import type { CustomWord } from '../types'
import { useApp, useActiveProfile } from '../state/AppState'
import { strings } from '../data/i18n'
import { speakArabic, speakRussian, speakSequence, type SpeechItem } from '../lib/audio'
import { useSpeak } from '../lib/useSpeak'
import { SpeakerButton } from '../components/SpeakerButton'
import { Sun } from '../components/Sun'
import { BigButton } from '../components/BigButton'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface Word {
  id: string
  word: string
  meaning: string
  emoji: string
}

/**
 * Игра «Слова»: нажал — услышал слово, выбрал картинку-значение.
 * Собирает встроенные слова-примеры всех букв + свои слова родителя.
 */
export function WordGameScreen() {
  const navigate = useNavigate()
  const { state } = useApp()
  const profile = useActiveProfile()
  const t = strings[state.settings.uiLang]
  const lang = state.settings.uiLang

  const [idx, setIdx] = useState(0)
  const [wrong, setWrong] = useState<string | null>(null)

  const builtIn: Word[] = letters.map((l) => ({
    id: l.id,
    word: l.word,
    meaning: l.wordRu,
    emoji: l.wordEmoji
  }))
  const custom: Word[] = state.customWords.map((w: CustomWord) => ({
    id: w.id,
    word: w.word,
    meaning: w.meaning,
    emoji: w.emoji
  }))

  const queue = useMemo(() => shuffle([...builtIn, ...custom]).slice(0, 8), [
    state.customWords.length
  ])
  // eslint-disable-next-line react-hooks/exhaustive-deps

  if (!profile) return <Navigate to="/" replace />

  const word = queue[idx]
  const finished = !word

  if (queue.length === 0) {
    return (
      <div className="screen lesson">
        <header className="lesson__head">
          <button className="back" type="button" onClick={() => navigate('/garden')}>
            ←
          </button>
          <div className="lesson__steps">
            <span className="step step--active" />
          </div>
          <div className="lesson__spacer" />
        </header>
        <div className="exercise">
          <Sun size={110} face={state.settings.sunFace} mood="hint" />
          <h2 className="exercise__title">{t.wordsTitle}</h2>
          <p className="exercise__hint">{t.emptyWords}</p>
          <BigButton size="lg" full onClick={() => navigate('/garden')}>
            {t.done}
          </BigButton>
        </div>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="screen lesson">
        <header className="lesson__head">
          <button className="back" type="button" onClick={() => navigate('/garden')}>
            ←
          </button>
          <div className="lesson__steps">
            <span className="step step--active" />
          </div>
          <div className="lesson__spacer" />
        </header>
        <div className="exercise lesson__done">
          <Sun size={110} face={state.settings.sunFace} mood="happy" />
          <h2 className="exercise__title">{t.greatJob}</h2>
          <div className="lesson__star">⭐</div>
          <div className="lesson__buttons">
            <BigButton variant="soft" full onClick={() => navigate('/garden')}>
              {t.done}
            </BigButton>
          </div>
        </div>
      </div>
    )
  }

  const options = useMemo(() => {
    const pool = [
      ...new Set(
        shuffle(queue.filter((w) => w.id !== word.id)).map((w) => w.emoji)
      )
    ].slice(0, 2)
    return shuffle([word.emoji, ...pool])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word.id])

  const wordItems: SpeechItem[] = [
    { text: t.wordListen, lang },
    { text: word.word, lang: 'ar' }
  ]
  useSpeak(`word-${word.id}`, wordItems)

  function playWord() {
    speakSequence([{ text: word.word, lang: 'ar' }])
  }

  function choose(emoji: string) {
    if (emoji === word.emoji) {
      if (lang === 'ar') speakArabic('أحسنت!')
      else speakRussian('Правильно!')
      setIdx((i) => i + 1)
    } else {
      setWrong(emoji)
      if (lang === 'ar') speakArabic('حاول مرّة أخرى')
      else speakRussian('Попробуй ещё раз')
      window.setTimeout(() => setWrong(null), 650)
    }
  }

  return (
    <div className="screen lesson">
      <header className="lesson__head">
        <button className="back" type="button" onClick={() => navigate('/garden')}>
          ←
        </button>
        <div className="lesson__steps">
          {queue.map((_, i) => (
            <span key={i} className={`step ${i <= idx ? 'step--active' : ''}`} />
          ))}
        </div>
        <div className="lesson__spacer" />
      </header>

      <div className="exercise">
        <SpeakerButton
          className="exercise__speaker"
          onSpeak={() => speakSequence(wordItems)}
          label={t.listenAgain}
        />

        <h2 className="exercise__title">{t.wordMatch}</h2>

        <button className="word-stage word-stage--small" type="button" onClick={playWord}>
          <span className="word-stage__glyph" lang="ar" dir="rtl">
            {word.word}
          </span>
        </button>

        <div className="emoji-options">
          {options.map((emoji, i) => (
            <button
              key={`${word.id}-${i}`}
              type="button"
              className={`emoji-option ${wrong === emoji ? 'emoji-option--wrong' : ''}`}
              onClick={() => choose(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}