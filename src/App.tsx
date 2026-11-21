import { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useApp, useActiveProfile } from './state/AppState'
import { strings } from './data/i18n'
import { setMuted } from './lib/audio'
import { ProfilesScreen } from './screens/ProfilesScreen'
import { GardenScreen } from './screens/GardenScreen'
import { LessonScreen } from './screens/LessonScreen'
import { ReviewScreen } from './screens/ReviewScreen'
import { WordGameScreen } from './screens/WordGameScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { AuthScreen } from './screens/AuthScreen'
import { AdminScreen } from './screens/AdminScreen'
import { PasswordSetupScreen } from './screens/PasswordSetupScreen'
import { useAuth } from './state/AuthState'

function hasPasswordSetupToken(): boolean {
  const url = window.location.href
  return /(?:[?#&])access_token=/.test(url)
}

function SessionBar() {
  const navigate = useNavigate()
  const { session, logout } = useAuth()

  if (!session?.authenticated) return null

  return <div className="session-bar">
    <span>{session.role === 'admin' ? 'Администратор' : 'Родитель'}</span>
    {session.role === 'admin' && <button type="button" onClick={() => navigate('/admin')}>Админ-панель</button>}
    <button type="button" onClick={async () => { await logout(); navigate('/auth', { replace: true }) }}>Выйти</button>
  </div>
}

function PlayerLevelBar() {
  const { state } = useApp()
  const profile = useActiveProfile()
  if (!profile) return null
  const trackIcons = { sprout: '🌱', flower: '🌸', tree: '🌳' } as const
  const t = strings[state.settings.uiLang]
  const trackAges = { sprout: t.sproutAge, flower: t.flowerAge, tree: t.treeAge } as const

  return <div className="player-level-bar" aria-label={`${profile.name}: ${t[profile.track]}`}>
    <span className="player-level-bar__name">{profile.name}</span>
    <span className="player-level-bar__track">
      {trackIcons[profile.track]} {t[profile.track]} · {trackAges[profile.track]}
    </span>
  </div>
}

function ProtectedRoutes() {
  const { session } = useAuth()

  if (!session) return <div className="screen screen--center"><p className="muted">Проверяем доступ…</p></div>
  if (!session.authenticated) return <Navigate to="/auth" replace />

  return <>
    <SessionBar />
    <PlayerLevelBar />
    <Routes>
    <Route path="/" element={<ProfilesScreen />} />
    <Route path="/garden" element={<GardenScreen />} />
    <Route path="/lesson/:letterId" element={<LessonScreen />} />
    <Route path="/review" element={<ReviewScreen />} />
    <Route path="/words" element={<WordGameScreen />} />
    <Route path="/settings" element={<SettingsScreen />} />
    <Route path="/admin" element={session.role === 'admin' ? <AdminScreen /> : <Navigate to="/" replace />} />
    <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </>
}

export default function App() {
  const { state } = useApp()

  useEffect(() => {
    setMuted(state.settings.muted)
  }, [state.settings.muted])

  useEffect(() => {
    document.documentElement.lang = state.settings.uiLang
  }, [state.settings.uiLang])

  const hasRecoveryToken = hasPasswordSetupToken()

  return (
    <div className="app">
      {hasRecoveryToken ? <PasswordSetupScreen /> : <Routes>
        <Route path="/auth" element={<AuthScreen />} />
        <Route path="*" element={<ProtectedRoutes />} />
      </Routes>}
    </div>
  )
}
