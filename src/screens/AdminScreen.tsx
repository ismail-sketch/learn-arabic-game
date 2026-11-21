import { useNavigate } from 'react-router-dom'
import { BigButton } from '../components/BigButton'
import { useAuth } from '../state/AuthState'

export function AdminScreen() {
  const navigate = useNavigate()
  const { session, logout } = useAuth()

  async function signOut() {
    await logout()
    navigate('/auth', { replace: true })
  }

  return (
    <div className="screen screen--center">
      <div className="card">
        <h1 className="app-title">Панель администратора</h1>
        <p className="muted">Вы вошли с правами администратора.</p>
        <div className="card">
          <h2 className="card__title">Статус доступа</h2>
          <p><strong>Роль:</strong> admin</p>
          <p><strong>Семья:</strong> {session?.familyId ?? 'не указана'}</p>
        </div>
        <p className="muted">Управление заявками и общим контентом будет добавлено следующим этапом.</p>
        <BigButton variant="soft" full onClick={() => navigate('/')}>Вернуться в приложение</BigButton>
        <BigButton variant="ghost" full onClick={signOut}>Выйти</BigButton>
      </div>
    </div>
  )
}
