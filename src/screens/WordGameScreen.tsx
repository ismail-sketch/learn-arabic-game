import { useMemo, useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { letters } from '../data/letters'
import type { CustomWord } from '../types'
import { useApp, useActiveProfile } from '../state/AppState'
import { strings } from '../data/i18n'
import { playClip, speakSequence, type SpeechItem } from '../lib/audio'
import { useSpeak } from '../lib/useSpeak'
import { SpeakerButton } from '../components/SpeakerButton'
import { Sun } from '../components/Sun'
import { BigButton } from '../components/BigButton'
import { WordIllustration } from '../components/WordIllustration'

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
  }))
  const custom: Word[] = state.customWords.map((w: CustomWord) => ({
    id: w.id,
    word: w.word,
    meaning: w.meaning,
  }))

  const queue = useMemo(() => shuffle([...builtIn, ...custom]).slice(0, 8), [
    state.customWords.length
  ])
  // eslint-disable-next-line react-hooks/exhaustive-deps

  if (!profile) return <Navigate to="/" replace />

  const word = queue[idx]
  const finished = !word

  const options = useMemo(() => {
    if (!word) return []
    const pool = [
      ...new Set(
        shuffle(queue.filter((w) => w.id !== word.id)).map((w) => w.id)
      )
    ].slice(0, 2)
    return shuffle([word.id, ...pool])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word?.id, queue])

  // Hook вызывается до любых return, в том числе на финальном экране.
  // Иначе после последнего слова React мог оставить пустой экран из-за
  // изменения порядка hooks.
  const wordItems: SpeechItem[] = word
    ? [
        { text: t.wordListen, lang, key: `instruction-word-${lang}` },
        { text: word.word, lang: 'ar', key: `letter-${word.id}-word` }
      ]
    : []
  useSpeak(`word-${word?.id ?? 'finished'}`, wordItems)

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

  function playWord() {
    if (word) speakSequence([{ text: word.word, lang: 'ar', key: `letter-${word.id}-word` }])
  }

  function choose(optionId: string) {
    if (optionId === word.id) {
      playClip(`praise-correct-${lang}`, { text: lang === 'ar' ? 'أحسنت!' : 'Правильно!', lang })
      setIdx((i) => i + 1)
    } else {
      setWrong(optionId)
      playClip(`praise-again-${lang}`, { text: lang === 'ar' ? 'حاول مرّة أخرى' : 'Попробуй ещё раз', lang })
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
          <span className="word-stage__meaning">{word.meaning}</span>
        </button>

      <div className="emoji-options">
        {options.map((optionId, i) => (
            <button
              key={`${word.id}-${optionId}-${i}`}
              type="button"
              className={`emoji-option ${wrong === optionId ? 'emoji-option--wrong' : ''}`}
              onClick={() => choose(optionId)}
            >
              <WordIllustration wordId={optionId} label={queue.find((item) => item.id === optionId)?.meaning ?? ''} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
