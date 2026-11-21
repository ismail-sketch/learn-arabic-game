import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import type { Letter } from '../data/letters'
import { letters } from '../data/letters'
import { useApp, useActiveProfile } from '../state/AppState'
import { strings } from '../data/i18n'
import { dueLetters } from '../lib/review'
import { playClip, speakSequence, type SpeechItem } from '../lib/audio'
import { useSpeak } from '../lib/useSpeak'
import { LetterText } from '../components/LetterText'
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

/** Выбирает 2 отвлекателя из выученных букв, похожих на данную. */
function distractorsFor(letter: Letter, learned: string[]): Letter[] {
  const pool = letters.filter((l) => l.id !== letter.id && learned.includes(l.id))
  const same = pool.filter((l) => l.family === letter.family)
  const others = pool.filter((l) => l.family !== letter.family)
  return shuffle([...same, ...shuffle(others).slice(0, 2)]).slice(0, 2)
}

export function ReviewScreen() {
  const navigate = useNavigate()
  const { state, reviewBatch } = useApp()
  const profile = useActiveProfile()
  const t = strings[state.settings.uiLang]
  const lang = state.settings.uiLang

  const [results, setResults] = useState<Record<string, boolean>>({})
  const [wrong, setWrong] = useState<string | null>(null)
  const appliedRef = useRef(false)

  const progress = profile ? state.progressByProfile[profile.id] ?? {} : {}
  const learned = letters.filter((l) => progress[l.id]?.learned)
  const due = dueLetters(progress)
  // Повторяем то, что пора закрепить; если такого нет — любые выученные.
  const queue = useMemo(() => {
    const src = due.length > 0 ? due : learned
    return shuffle(src).slice(0, 6)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const idx = Object.keys(results).length
  const letter = queue[idx]
  const finished = queue.length > 0 && !letter
  const options = useMemo(
    () => letter ? shuffle([letter, ...distractorsFor(letter, learned.map((l) => l.id))]) : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [letter?.id]
  )

  if (!profile) return <Navigate to="/" replace />

  // Применяем результаты повторения один раз, когда очередь пройдена.
  useEffect(() => {
    if (finished && !appliedRef.current) {
      appliedRef.current = true
      reviewBatch(results)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished])

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
          <h2 className="exercise__title">{t.reviewTitle}</h2>
          <p className="exercise__hint">{t.reviewEmpty}</p>
          <BigButton size="lg" full onClick={() => navigate('/garden')}>
            {t.done}
          </BigButton>
        </div>
      </div>
    )
  }

  if (finished) {
    const okCount = Object.values(results).filter(Boolean).length
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
          <h2 className="exercise__title">{t.reviewDone}</h2>
          <div className="lesson__star">⭐ × {okCount}</div>
          <div className="lesson__buttons">
            <BigButton variant="soft" full onClick={() => navigate('/garden')}>
              {t.done}
            </BigButton>
          </div>
        </div>
      </div>
    )
  }

  const reviewItems: SpeechItem[] = [
    { text: t.reviewListen, lang, key: `instruction-review-${lang}` },
    { text: letter.ttsName, lang: 'ar', key: `letter-${letter.id}-name` }
  ]
  useSpeak(`review-${letter.id}`, reviewItems)

  function choose(opt: Letter) {
    if (opt.id === letter.id) {
      setResults((r) => ({ ...r, [letter.id]: true }))
      playClip(`praise-correct-${lang}`, { text: lang === 'ar' ? 'أحسنتَ' : 'Молодец!', lang })
    } else {
      setResults((r) => ({ ...r, [letter.id]: false }))
      setWrong(opt.id)
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
          onSpeak={() => speakSequence(reviewItems)}
          label={t.listenAgain}
        />

        <h2 className="exercise__title">
          {t.findLetter} <span className="lat">{letter.nameAr}</span>
        </h2>

        <div className="options options--3">
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`option ${wrong === opt.id ? 'option--wrong' : ''}`}
              onClick={() => choose(opt)}
            >
              <LetterText letter={opt} className="option__glyph" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
