import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Track } from '../types'
import { useApp } from '../state/AppState'
import { strings } from '../data/i18n'
import type { Strings } from '../data/i18n'
import { Sun } from '../components/Sun'
import { BigButton } from '../components/BigButton'

const AVATARS = ['🌱', '🌸', '🌳', '🌷', '🌻', '🍀']

const TRACKS: { id: Track; icon: string }[] = [
  { id: 'sprout', icon: '🌱' },
  { id: 'flower', icon: '🌸' },
  { id: 'tree', icon: '🌳' }
]

function descOf(id: Track, t: Strings): string {
  return id === 'sprout' ? t.sproutDesc : id === 'flower' ? t.flowerDesc : t.treeDesc
}

export function ProfilesScreen() {
  const navigate = useNavigate()
  const { state, addProfile, setActive } = useApp()
  const t = strings[state.settings.uiLang]

  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [track, setTrack] = useState<Track>('sprout')
  const [avatar, setAvatar] = useState(AVATARS[0])

  function submit(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    const id = addProfile(trimmed, track, avatar)
    setName('')
    setAdding(false)
    setActive(id)
    navigate('/garden')
  }

  function pick(id: string) {
    setActive(id)
    navigate('/garden')
  }

  return (
    <div className="screen screen--center">
      <div className="skrim" />

      <header className="profiles__head">
        <Sun size={96} face={state.settings.sunFace} mood="happy" />
        <h1 className="app-title">{t.appName}</h1>
        <p className="app-subtitle lat">{t.subtitle}</p>
      </header>

      <div className="profiles">
        {!adding && state.profiles.length > 0 && (
          <>
            <p className="muted">{t.whoPlays}</p>
            <div className="profile-grid">
              {state.profiles.map((p) => (
                <button key={p.id} className="profile-card" type="button" onClick={() => pick(p.id)}>
                  <span className="profile-card__avatar">{p.avatar}</span>
                  <span className="profile-card__name">{p.name}</span>
                  <span className="profile-card__track">
                    {TRACKS.find((tr) => tr.id === p.track)?.icon} {strings[state.settings.uiLang][p.track]}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {!adding && state.profiles.length === 0 && (
          <p className="muted">{t.noProfilesYet}</p>
        )}

        {adding ? (
          <form className="card form" onSubmit={submit}>
            <label className="field">
              <span>{t.childName}</span>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.childName}
                inputMode="text"
              />
            </label>

            <div className="field">
              <span>{t.chooseTrack}</span>
              <div className="track-picker">
                {TRACKS.map((tr) => (
                  <button
                    key={tr.id}
                    type="button"
                    className={`track ${track === tr.id ? 'track--active' : ''}`}
                    onClick={() => setTrack(tr.id)}
                  >
                    <span className="track__icon">{tr.icon}</span>
                    <span className="track__name">{strings[state.settings.uiLang][tr.id]}</span>
                    <span className="track__desc">{descOf(tr.id, t)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <span>🌱</span>
              <div className="avatar-row">
                {AVATARS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    className={`avatar ${avatar === a ? 'avatar--active' : ''}`}
                    onClick={() => setAvatar(a)}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div className="form__actions">
              <BigButton variant="ghost" type="button" onClick={() => setAdding(false)}>
                {t.cancel}
              </BigButton>
              <BigButton type="submit">{t.save}</BigButton>
            </div>
          </form>
        ) : (
          <BigButton
            size="lg"
            variant="soft"
            full
            onClick={() => {
              setAvatar(AVATARS[Math.floor(Math.random() * AVATARS.length)])
              setTrack('sprout')
              setAdding(true)
            }}
          >
            ＋ {t.addChild}
          </BigButton>
        )}
      </div>

      <button className="gear" type="button" aria-label={t.settings} onClick={() => navigate('/settings')}>
        ⚙
      </button>
      <div className="profiles__admin-actions">
        <BigButton variant="soft" onClick={() => navigate('/settings')}>Настройки родителя</BigButton>
      </div>
    </div>
  )
}
