import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, useActiveProfile } from '../state/AppState'
import { strings } from '../data/i18n'
import { BigButton } from '../components/BigButton'

const EMOJIS = ['🐪', '🐴', '🐻', '🍞', '🌽', '🌸', '🚪', '👑', '❄️', '🐟', '🦁', '🌙', '⭐', '📚', '🕌', '🍎', '🐝', '🐦']

export function SettingsScreen() {
  const navigate = useNavigate()
  const { state, updateSettings, removeProfile, resetProgress, addCustomWord, removeCustomWord } =
    useApp()
  const profile = useActiveProfile()
  const t = strings[state.settings.uiLang]
  const s = state.settings

  const [word, setWord] = useState('')
  const [meaning, setMeaning] = useState('')
  const [emoji, setEmoji] = useState(EMOJIS[0])

  function submitWord(e: FormEvent) {
    e.preventDefault()
    const w = word.trim()
    if (!w) return
    addCustomWord(w, meaning.trim(), emoji)
    setWord('')
    setMeaning('')
  }

  async function refreshApp() {
    if (!window.confirm(`${t.refreshApp}?\n${t.refreshAppHint}`)) return
    try {
      if ('caches' in window) {
        const names = await caches.keys()
        await Promise.all(names.map((name) => caches.delete(name)))
      }
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        await Promise.all(registrations.map((registration) => registration.update()))
      }
    } finally {
      // localStorage не очищаем: там находятся прогресс и локальная копия семьи.
      window.location.reload()
    }
  }

  return (
    <div className="screen settings">
      <header className="lesson__head">
        <button className="back" type="button" onClick={() => navigate(-1)}>
          ←
        </button>
        <h1 className="settings__title">{t.settings}</h1>
        <div className="lesson__spacer" />
      </header>

      <section className="card">
        <div className="setting-row">
          <span className="setting-row__label">{t.interfaceLang}</span>
          <div className="segmented">
            <button
              className={s.uiLang === 'ru' ? 'seg seg--active' : 'seg'}
              type="button"
              onClick={() => updateSettings({ uiLang: 'ru' })}
            >
              Русский
            </button>
            <button
              className={s.uiLang === 'ar' ? 'seg seg--active' : 'seg'}
              type="button"
              onClick={() => updateSettings({ uiLang: 'ar' })}
            >
              العربية
            </button>
          </div>
        </div>

        <div className="setting-row">
          <span className="setting-row__label">
            {t.sunFace}
            <small className="setting-row__hint">{t.sunFaceHint}</small>
          </span>
          <button
            type="button"
            className={`switch ${s.sunFace ? 'switch--on' : ''}`}
            onClick={() => updateSettings({ sunFace: !s.sunFace })}
            aria-pressed={s.sunFace}
          >
            <span className="switch__knob" />
          </button>
        </div>

        <div className="setting-row">
          <span className="setting-row__label">{s.muted ? t.audioOff : t.audioOn}</span>
          <button
            type="button"
            className={`switch ${!s.muted ? 'switch--on' : ''}`}
            onClick={() => updateSettings({ muted: !s.muted })}
            aria-pressed={!s.muted}
          >
            <span className="switch__knob" />
          </button>
        </div>
      </section>

      <section className="card">
        <h2 className="card__title">{t.myWords}</h2>
        <form className="word-form" onSubmit={submitWord}>
          <label className="field">
            <span>{t.wordField}</span>
            <input
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="بَيْت"
              lang="ar"
              dir="rtl"
            />
          </label>
          <label className="field">
            <span>{t.meaningField}</span>
            <input
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              placeholder="дом"
            />
          </label>
          <div className="field">
            <span>{t.emojiField}</span>
            <div className="emoji-picker">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  className={`emoji-pick ${emoji === e ? 'emoji-pick--active' : ''}`}
                  onClick={() => setEmoji(e)}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <BigButton type="submit" full>
            ＋ {t.addWord}
          </BigButton>
        </form>

        <ul className="word-list">
          {state.customWords.length === 0 && <li className="muted">{t.emptyWords}</li>}
          {state.customWords.map((w) => (
            <li key={w.id} className="word-list__item">
              <span className="word-list__emoji">{w.emoji}</span>
              <span className="word-list__word lat" lang="ar" dir="rtl">
                {w.word}
              </span>
              <span className="word-list__meaning">{w.meaning}</span>
              <button
                type="button"
                className="danger"
                onClick={() => removeCustomWord(w.id)}
                aria-label={t.remove}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2 className="card__title">{t.whoPlays}</h2>
        <ul className="profile-list">
          {state.profiles.map((p) => (
            <li key={p.id} className="profile-list__item">
              <span className="profile-list__avatar">{p.avatar}</span>
              <span className="profile-list__name">{p.name}</span>
              <span className="profile-list__track">{strings[s.uiLang][p.track]}</span>
              <button
                type="button"
                className="danger"
                onClick={() => {
                  if (window.confirm(t.confirmDelete)) removeProfile(p.id)
                }}
              >
                ✕
              </button>
            </li>
          ))}
          {state.profiles.length === 0 && <li className="muted">{t.noProfilesYet}</li>}
        </ul>
      </section>

      {profile && (
        <section className="card">
          <h2 className="card__title">{profile.name}</h2>
          <BigButton
            variant="ghost"
            full
            onClick={() => {
              if (window.confirm(t.resetConfirm)) resetProgress()
            }}
          >
            {t.resetProgress}
          </BigButton>
        </section>
      )}

      <section className="card settings__refresh">
        <h2 className="card__title">{t.refreshApp}</h2>
        <p className="muted">{t.refreshAppHint}</p>
        <BigButton variant="soft" full onClick={() => void refreshApp()}>
          {t.refreshApp}
        </BigButton>
      </section>

      <p className="settings__about lat">حديقة الحروف · Сад букв · v0.2</p>
    </div>
  )
}
