import { useRef, useState } from 'react'
import type { Letter } from '../data/letters'
import { letters } from '../data/letters'
import type { UiLang } from '../types'
import { strings } from '../data/i18n'
import { playClip, speakSequence, type SpeechItem } from '../lib/audio'
import { useSpeak } from '../lib/useSpeak'
import { BigButton } from '../components/BigButton'
import { SpeakerButton } from '../components/SpeakerButton'

interface Props {
  letter: Letter
  lang: UiLang
  onComplete: () => void
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Старшая дорожка: прочитать слово и понять его значение. */
export function ReadWord({ letter, lang, onComplete }: Props) {
  const t = strings[lang]
  const [phase, setPhase] = useState<'read' | 'quiz'>('read')
  const [wrong, setWrong] = useState<string | null>(null)
  const [round, setRound] = useState(0)
  const completedRef = useRef(false)

  const options = (() => {
    const distractors = shuffle(letters.filter((l) => l.id !== letter.id))
      .slice(0, 2)
      .map((l) => l.wordEmoji)
    return shuffle([letter.wordEmoji, ...distractors])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  })()

  function playWord() {
    playClip(`letter-${letter.id}-word`, { text: letter.ttsWord, lang: 'ar' })
  }

  const readItems: SpeechItem[] = [
    { text: t.wordListen, lang, key: `instruction-word-${lang}` },
    { text: letter.ttsWord, lang: 'ar', key: `letter-${letter.id}-word` }
  ]
  const quizItems: SpeechItem[] = [{ text: t.wordMatch, lang, key: `instruction-match-${lang}` }]
  useSpeak(`word-${letter.id}-${phase}`, phase === 'read' ? readItems : quizItems)

  function choose(emoji: string) {
    if (emoji === letter.wordEmoji) {
      if (completedRef.current) return
      completedRef.current = true
      onComplete()
    } else {
      setWrong(emoji)
      playClip(`praise-again-${lang}`, { text: lang === 'ar' ? 'حاول مرّة أخرى' : 'Попробуй ещё раз', lang })
      window.setTimeout(() => setWrong(null), 650)
    }
  }

  if (phase === 'read') {
    return (
      <div className="exercise">
        <SpeakerButton
          className="exercise__speaker"
          onSpeak={() => speakSequence(readItems)}
          label={t.listenAgain}
        />
        <h2 className="exercise__title">{t.readWordTitle}</h2>

        <button className="word-stage" type="button" onClick={playWord}>
          <span className="word-stage__glyph" lang="ar" dir="rtl">
            {letter.word}
          </span>
          <span className="word-stage__emoji">{letter.wordEmoji}</span>
        </button>

        <p className="exercise__hint">{t.listenWord}</p>

        <BigButton size="lg" full onClick={() => setPhase('quiz')}>
          {t.next}
        </BigButton>
      </div>
    )
  }

  return (
    <div className="exercise">
      <SpeakerButton
        className="exercise__speaker"
        onSpeak={() => speakSequence(quizItems)}
        label={t.listenAgain}
      />
      <h2 className="exercise__title">{t.whatIsIt}</h2>

      <div className="word-stage word-stage--small" aria-hidden="true">
        <span className="word-stage__glyph" lang="ar" dir="rtl">
          {letter.word}
        </span>
      </div>

      <div className="emoji-options">
        {options.map((emoji) => (
          <button
            key={`${round}-${emoji}`}
            type="button"
            className={`emoji-option ${wrong === emoji ? 'emoji-option--wrong' : ''}`}
            onClick={() => choose(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>

      <button className="link" type="button" onClick={() => setRound((r) => r + 1)}>
        {t.tryAgain}
      </button>
    </div>
  )
}
