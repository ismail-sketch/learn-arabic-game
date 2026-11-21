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
        <Route path="/" element={<ProfilesScreen />} />
        <Route path="/garden" element={<GardenScreen />} />
        <Route path="/lesson/:letterId" element={<LessonScreen />} />
        <Route path="/review" element={<ReviewScreen />} />
        <Route path="/words" element={<WordGameScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}