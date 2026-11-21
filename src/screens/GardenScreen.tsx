import { useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { letters } from '../data/letters'
import { useApp, useActiveProfile } from '../state/AppState'
import { strings } from '../data/i18n'
import { dueLetters } from '../lib/review'
import { speakSequence } from '../lib/audio'
import { Sun } from '../components/Sun'
import { BedScene } from '../components/BedScene'
import { ParentGate } from '../components/ParentGate'

const PLANT_COLORS = ['#e58a8a', '#e9a24c', '#c88bcf', '#f0b46a']
const greetedProfiles = new Set<string>()

export function GardenScreen() {
  const navigate = useNavigate()
  const { state } = useApp()
  const profile = useActiveProfile()
  const t = strings[state.settings.uiLang]

  if (!profile) return <Navigate to="/" replace />

  const progress = state.progressByProfile[profile.id] ?? {}
  const learnedCount = letters.filter((l) => progress[l.id]?.learned).length
  const stars = Object.values(progress).reduce((sum, p) => sum + (p.stars ?? 0), 0)
  const dueCount = dueLetters(progress).length

  // В StrictMode эффект в разработке может проверяться повторно. Не ставим
  // приветствие в очередь второй раз для того же профиля.
  useEffect(() => {
    if (greetedProfiles.has(profile.id)) return
    greetedProfiles.add(profile.id)
    const hello = state.settings.uiLang === 'ar' ? 'أهلًا' : 'Привет'
    speakSequence([
      { text: hello, lang: state.settings.uiLang, key: `greeting-${state.settings.uiLang}` },
      { text: profile.name, lang: state.settings.uiLang }
    ])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const nextLetter = letters.find((letter) => !progress[letter.id]?.learned) ?? letters[letters.length - 1]
  const missionDone = Boolean(progress[nextLetter.id]?.learned)
  const zoneProgress = Math.round((learnedCount / letters.length) * 100)

  return (
    <div className="screen garden garden--map">
      <header className="garden__head garden__head--map">
        <button className="avatar-btn" type="button" onClick={() => navigate('/')} aria-label={t.whoPlays}>
          {profile.avatar}
        </button>

        <div className="garden__hello">
          <Sun size={56} face={state.settings.sunFace} mood="happy" />
          <div>
            <p className="map__eyebrow">ПУТЕШЕСТВИЕ ФУСХА</p>
            <h1 className="garden__title">{t.myGarden}</h1>
            <p className="garden__name">{profile.name} · путь знаний</p>
          </div>
        </div>

        <ParentGate
          label={t.parents}
          holdLabel={t.keepHolding}
          onUnlock={() => navigate('/settings')}
        />
      </header>

      <section className="mission-card" aria-label="Миссия дня">
        <div className="mission-card__topline">
          <span className="mission-card__kicker">МИССИЯ ДНЯ</span>
          <span className="mission-card__reward">✦ +1</span>
        </div>
        <div className="mission-card__body">
          <div className="mission-card__seal">{missionDone ? '✓' : 'ب'}</div>
          <div>
            <h2>{missionDone ? 'Миссия выполнена' : 'Открой новую букву'}</h2>
            <p>{missionDone ? 'Можно повторить букву или выбрать следующий остров.' : `Познакомься с буквой ${nextLetter.nameAr}`}</p>
          </div>
        </div>
        <button className="btn btn--primary btn--full mission-card__button" type="button" onClick={() => navigate(`/lesson/${nextLetter.id}`)}>
          {missionDone ? 'Повторить путешествие' : 'Начать миссию'} <span>→</span>
        </button>
      </section>

      <div className="stats stats--map">
        <div className="stat">
          <span className="stat__value">⭐ {stars}</span>
          <span className="stat__label">{t.starsLabel}</span>
        </div>
        <div className="stat">
          <span className="stat__value">🌱 {learnedCount}/{letters.length}</span>
          <span className="stat__label">{t.learnedCount}</span>
        </div>
      </div>

      <div className="garden__actions garden__actions--map">
        <button
          type="button"
          className={`garden-action ${dueCount > 0 ? 'garden-action--due' : ''}`}
          onClick={() => navigate('/review')}
        >
          <span className="garden-action__icon">🔁</span>
          <span className="garden-action__label">{t.review}</span>
          {dueCount > 0 && <span className="garden-action__badge">{dueCount}</span>}
        </button>
        <button type="button" className="garden-action" onClick={() => navigate('/words')}>
          <span className="garden-action__icon">📖</span>
          <span className="garden-action__label">{t.words}</span>
          {state.customWords.length > 0 && (
            <span className="garden-action__badge">{state.customWords.length}</span>
          )}
        </button>
      </div>

      <section className="map-section">
        <div className="map-section__head">
          <div>
            <p className="map__eyebrow">МАРШРУТ 01</p>
            <h2>Долина букв</h2>
          </div>
          <span className="map-section__percent">{zoneProgress}%</span>
        </div>
        <div className="map-progress"><span style={{ width: `${zoneProgress}%` }} /></div>
      </section>

      <div className="beds beds--map">
        {letters.map((letter) => {
          const learned = progress[letter.id]?.learned ?? false
          return (
            <button
              key={letter.id}
              type="button"
              className={`bed ${learned ? 'bed--learned' : ''}`}
              onClick={() => navigate(`/lesson/${letter.id}`)}
            >
              <BedScene
                letter={letter}
                learned={learned}
                plantColor={PLANT_COLORS[letter.order % PLANT_COLORS.length]}
              />
              <span className="bed__label lat">{letter.nameAr}</span>
              <span className="bed__sub">{letter.nameRu}</span>
            </button>
          )
        })}
      </div>

      <p className="garden__hint">Выбирай остров и открывай буквы в своём темпе</p>
    </div>
  )
}
