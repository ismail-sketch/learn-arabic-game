import { useMemo, useState } from 'react'
import type { Letter } from '../data/letters'
import { getDistractors } from '../data/letters'
import type { Track, UiLang } from '../types'
import { strings } from '../data/i18n'
import { playClip, speakSequence, type SpeechItem } from '../lib/audio'
import { useSpeak } from '../lib/useSpeak'
import { LetterText } from '../components/LetterText'
import { SpeakerButton } from '../components/SpeakerButton'
import { BigButton } from '../components/BigButton'

interface Props {
  letter: Letter
  track: Track
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

/** Сколько похожих букв-отвлекателей показывать в викторине. */
function distractorCount(track: Track): number {
  if (track === 'sprout') return 0
  if (track === 'flower') return 1
  return 2
}

export function ListenTap({ letter, track, lang, onComplete }: Props) {
  const t = strings[lang]
  const [phase, setPhase] = useState<'learn' | 'find'>('learn')
  const [listenCount, setListenCount] = useState(0)
  const [wrongId, setWrongId] = useState<string | null>(null)
  const [round, setRound] = useState(0)

  const options = useMemo(() => {
    const need = distractorCount(track)
    return shuffle([letter, ...getDistractors(letter, need)])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [letter.id, track, round])

  const showQuiz = distractorCount(track) > 0

  const learnItems: SpeechItem[] = [
    { text: t.listenInstruction, lang, key: `instruction-listen-${lang}` },
    { text: letter.ttsName, lang: 'ar', key: `letter-${letter.id}-name` }
  ]
  const findItems: SpeechItem[] = [
    { text: t.findLetter, lang, key: `instruction-find-${lang}` },
    { text: letter.ttsName, lang: 'ar', key: `letter-${letter.id}-name` }
  ]
  useSpeak(`listen-${letter.id}-${phase}`, phase === 'learn' ? learnItems : findItems)

  function praise() {
    playClip(`praise-correct-${lang}`, { text: lang === 'ar' ? 'أحسنتَ' : 'Молодец!', lang })
  }

  function playLetter() {
    setListenCount((c) => c + 1)
    playClip(`letter-${letter.id}-name`, { text: letter.ttsName, lang: 'ar' })
  }

  function choose(opt: Letter) {
    if (opt.id === letter.id) {
      praise()
      onComplete()
    } else {
      setWrongId(opt.id)
      playClip(`praise-again-${lang}`, { text: lang === 'ar' ? 'حاول مرّة أخرى' : 'Попробуй ещё раз', lang })
      window.setTimeout(() => setWrongId(null), 650)
    }
  }

  function next() {
    if (showQuiz) setPhase('find')
    else onComplete()
  }

  if (phase === 'learn') {
    return (
      <div className="exercise">
        <SpeakerButton
          className="exercise__speaker"
          onSpeak={() => speakSequence(learnItems)}
          label={t.listenAgain}
        />

        <h2 className="exercise__title">{t.listenTitle}</h2>

        <button
          className="letter-stage"
          type="button"
          onClick={playLetter}
          aria-label={t.playSound}
        >
          <LetterText letter={letter} className="letter-stage__glyph" />
        </button>

        <p className="exercise__hint">
          {t.playAgain}: <strong className="lat">{letter.nameAr}</strong> · {letter.nameRu}
        </p>

        <div className="pill-row">
          <span className="pill">
            {letter.dotCount > 0
              ? `${t.dotCountLabel}: ${letter.dotCount}`
              : t.noDots}
          </span>
          {letter.dotCount > 0 && (
            <span className="dots">
              {Array.from({ length: letter.dotCount }).map((_, i) => (
                <span key={i} className="dot" />
              ))}
            </span>
          )}
        </div>

        <BigButton size="lg" full onClick={next} disabled={listenCount < 1}>
          {t.next}
        </BigButton>
      </div>
    )
  }

  return (
    <div className="exercise">
      <SpeakerButton
        className="exercise__speaker"
        onSpeak={() => speakSequence(findItems)}
        label={t.listenAgain}
      />

      <h2 className="exercise__title">
        {t.findLetter} <span className="lat">{letter.char}</span>
      </h2>

      <div className={`options options--${options.length}`}>
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`option ${wrongId === opt.id ? 'option--wrong' : ''}`}
            onClick={() => choose(opt)}
          >
            <LetterText letter={opt} className="option__glyph" />
          </button>
        ))}
      </div>

      <button className="link" type="button" onClick={() => setRound((r) => r + 1)}>
        {t.tryAgain}
      </button>
    </div>
  )
}
