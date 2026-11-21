import { useState } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { getLetter } from '../data/letters'
import { useApp, useActiveProfile } from '../state/AppState'
import { strings } from '../data/i18n'
import type { Track } from '../types'
import { Sun } from '../components/Sun'
import { BigButton } from '../components/BigButton'
import { Plant } from '../components/Plant'
import { ListenTap } from '../lessons/ListenTap'
import { TraceLetter } from '../lessons/TraceLetter'
import { ReadWord } from '../lessons/ReadWord'
import { playClip } from '../lib/audio'

type StepId = 'listen' | 'trace' | 'read'

function stepLabel(step: StepId, lang: 'ru' | 'ar'): string {
  if (lang === 'ar') {
    return step === 'listen' ? 'استمع وتعرّف' : step === 'trace' ? 'تتبّع الحرف' : 'اقرأ الكلمة'
  }
  return step === 'listen' ? 'Узнай букву' : step === 'trace' ? 'Обведи букву' : 'Прочитай слово'
}

function stepsFor(track: Track): StepId[] {
  // Росточек: послушал + обвёл. Цветочек: + поиск (внутри "listen").
  // Деревце: дополнительно читает слово.
  if (track === 'tree') return ['listen', 'trace', 'read']
  return ['listen', 'trace']
}

export function LessonScreen() {
  const { letterId } = useParams()
  const navigate = useNavigate()
  const { state, completeLesson } = useApp()
  const profile = useActiveProfile()
  const letter = getLetter(letterId)
  const t = strings[state.settings.uiLang]

  const [step, setStep] = useState(0)

  if (!profile) return <Navigate to="/" replace />
  if (!letter) return <Navigate to="/garden" replace />

  const activeLetter = letter
  const steps = stepsFor(profile.track)
  const total = steps.length
  const finished = step >= total
  const current = finished ? undefined : steps[step]
  const progressPercent = Math.min(100, Math.round((Math.min(step, total) / total) * 100))

  function praiseSpeech() {
    playClip(`praise-correct-${state.settings.uiLang}`, {
      text: state.settings.uiLang === 'ar' ? 'أحسنتَ!' : 'Молодец!',
      lang: state.settings.uiLang
    })
  }

  function advance() {
    if (step + 1 >= total) {
      completeLesson(activeLetter.id)
      praiseSpeech()
      setStep(total) // экран «Готово»
    } else {
      setStep((s) => s + 1)
    }
  }

  return (
    <div className="screen lesson lesson--mission">
      <header className="lesson__head">
        <button className="back" type="button" onClick={() => navigate('/garden')}>
          ←
        </button>
        <div className="lesson__route">
          <span className="lesson__route-label">{state.settings.uiLang === 'ar' ? 'مهمّة الحرف' : 'МИССИЯ БУКВЫ'}</span>
          <div className="lesson__steps">
            {steps.map((_, i) => (
              <span key={i} className={`step ${i < step || finished ? 'step--active' : ''}`} />
            ))}
          </div>
        </div>
        <span className="lesson__counter">{Math.min(step + 1, total)}/{total}</span>
      </header>

      {!finished && (
        <section className="lesson__intro">
          <div className="lesson__letter-badge" lang="ar" dir="rtl">{activeLetter.char}</div>
          <div>
            <p className="map__eyebrow">{state.settings.uiLang === 'ar' ? 'الطريق إلى القراءة' : 'ПУТЬ К ЧТЕНИЮ'}</p>
            <h1>{activeLetter.nameAr}</h1>
            <p>{stepLabel(current ?? 'listen', state.settings.uiLang)} · {activeLetter.nameRu}</p>
          </div>
          <div className="lesson__percent">{progressPercent}%</div>
        </section>
      )}

      {!finished && current === 'listen' && (
        <ListenTap letter={activeLetter} track={profile.track} lang={state.settings.uiLang} onComplete={advance} />
      )}

      {!finished && current === 'trace' && (
        <TraceLetter letter={activeLetter} track={profile.track} lang={state.settings.uiLang} onComplete={advance} />
      )}

      {!finished && current === 'read' && (
        <ReadWord letter={activeLetter} lang={state.settings.uiLang} onComplete={advance} />
      )}

      {finished && (
        <div className="exercise lesson__done">
          <Sun size={120} face={state.settings.sunFace} mood="happy" />
          <h2 className="exercise__title">{t.greatJob}</h2>
          <div className="lesson__bloom">
            <Plant color="#e58a8a" />
          </div>
          <div className="lesson__star">⭐</div>
          <div className="lesson__buttons">
            <BigButton variant="soft" onClick={() => navigate('/garden')}>
              {t.done}
            </BigButton>
          </div>
        </div>
      )}
    </div>
  )
}
