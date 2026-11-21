import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { BigButton } from '../components/BigButton'
import { authRepository } from '../data/auth'
import { useAuth } from '../state/AuthState'

function recoveryToken(): string | null {
  const url = window.location.href
  const match = url.match(/(?:[?#&])access_token=([^&#]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

export function PasswordSetupScreen() {
  const navigate = useNavigate()
  const { refresh } = useAuth()
  const [password, setPassword] = useState('')
  const [repeat, setRepeat] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const token = recoveryToken()

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!token) { setMessage('Ссылка приглашения недействительна или устарела.'); return }
    if (password.length < 8) { setMessage('Пароль должен содержать минимум 8 символов.'); return }
    if (password !== repeat) { setMessage('Пароли не совпадают.'); return }
    setBusy(true); setMessage('')
    try {
      await authRepository.setPassword(token, password)
      await refresh()
      window.history.replaceState({}, document.title, window.location.pathname)
      setMessage('Пароль сохранён. Открываем приложение…')
      navigate('/', { replace: true })
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Не удалось установить пароль') }
    finally { setBusy(false) }
  }

  return <div className="screen screen--center"><div className="card form">
    <h1 className="app-title">Завершение регистрации</h1>
    <p className="muted">Создайте пароль для семейного аккаунта.</p>
    <form className="form" onSubmit={submit}>
      <label className="field"><span>Новый пароль</span><input required minLength={8} type="password" value={password} onChange={e => setPassword(e.target.value)} /></label>
      <label className="field"><span>Повторите пароль</span><input required minLength={8} type="password" value={repeat} onChange={e => setRepeat(e.target.value)} /></label>
      <BigButton disabled={busy} type="submit">{busy ? 'Сохраняем…' : 'Сохранить пароль'}</BigButton>
    </form>
    {message && <p className="muted">{message}</p>}
  </div></div>
}
