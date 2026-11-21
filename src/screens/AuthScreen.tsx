import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { authRepository } from '../data/auth'
import { BigButton } from '../components/BigButton'

export function AuthScreen() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'request'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('')
    try {
      if (mode === 'request') {
        await authRepository.requestAccess(name, email)
        setMessage('Заявка отправлена. После подтверждения администратора вы сможете войти.')
      } else {
        await authRepository.login(email, password); navigate('/')
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Произошла ошибка') }
    finally { setBusy(false) }
  }

  return <div className="screen screen--center"><div className="card form">
    <h1 className="app-title">Сад букв</h1>
    <p className="muted">{mode === 'login' ? 'Вход для родителя' : 'Заявка для семьи'}</p>
    <form className="form" onSubmit={submit}>
      {mode === 'request' && <label className="field"><span>Имя родителя</span><input required value={name} onChange={e => setName(e.target.value)} /></label>}
      <label className="field"><span>Email</span><input required type="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
      {mode === 'login' && <label className="field"><span>Пароль</span><input required type="password" value={password} onChange={e => setPassword(e.target.value)} /></label>}
      <BigButton disabled={busy} type="submit">{busy ? 'Подождите…' : mode === 'login' ? 'Войти' : 'Отправить заявку'}</BigButton>
    </form>
    {message && <p className="muted">{message}</p>}
    <BigButton variant="ghost" type="button" onClick={() => { setMode(mode === 'login' ? 'request' : 'login'); setMessage('') }}>{mode === 'login' ? 'Нужен доступ? Подать заявку' : 'У меня уже есть доступ'}</BigButton>
  </div></div>
}
