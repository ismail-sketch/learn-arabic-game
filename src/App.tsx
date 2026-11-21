import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './state/AppState'
import { setMuted } from './lib/audio'
import { ProfilesScreen } from './screens/ProfilesScreen'
import { GardenScreen } from './screens/GardenScreen'
import { LessonScreen } from './screens/LessonScreen'
import { ReviewScreen } from './screens/ReviewScreen'
import { WordGameScreen } from './screens/WordGameScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { AuthScreen } from './screens/AuthScreen'
import { AdminScreen } from './screens/AdminScreen'
import { useAuth } from './state/AuthState'

function ProtectedRoutes() {
  const { session } = useAuth()

  if (!session) return <div className="screen screen--center"><p className="muted">Проверяем доступ…</p></div>
  if (!session.authenticated) return <Navigate to="/auth" replace />

  return <Routes>
    <Route path="/" element={<ProfilesScreen />} />
    <Route path="/garden" element={<GardenScreen />} />
    <Route path="/lesson/:letterId" element={<LessonScreen />} />
    <Route path="/review" element={<ReviewScreen />} />
    <Route path="/words" element={<WordGameScreen />} />
    <Route path="/settings" element={<SettingsScreen />} />
    <Route path="/admin" element={session.role === 'admin' ? <AdminScreen /> : <Navigate to="/" replace />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}

export default function App() {
  const { state } = useApp()

  useEffect(() => {
    setMuted(state.settings.muted)
  }, [state.settings.muted])

  useEffect(() => {
    document.documentElement.lang = state.settings.uiLang
  }, [state.settings.uiLang])

  return (
    <div className="app">
      <Routes>
        <Route path="/auth" element={<AuthScreen />} />
        <Route path="*" element={<ProtectedRoutes />} />
      </Routes>
    </div>
  )
}
