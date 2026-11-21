import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BigButton } from '../components/BigButton'
import { useAuth } from '../state/AuthState'
import { authRepository, type RegistrationRequest } from '../data/auth'

export function AdminScreen() {
  const navigate = useNavigate()
  const { session, logout } = useAuth()
  const [requests, setRequests] = useState<RegistrationRequest[]>([])
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  async function loadRequests() {
    try { setRequests(await authRepository.requests()); setError('') }
    catch (error) { setError(error instanceof Error ? error.message : 'Не удалось загрузить заявки') }
  }

  useEffect(() => { void loadRequests() }, [])

  async function review(id: string, action: 'approve' | 'reject') {
    setBusyId(id); setError('')
    try { await authRepository.review(id, action); await loadRequests() }
    catch (error) { setError(error instanceof Error ? error.message : 'Не удалось обработать заявку') }
    finally { setBusyId(null) }
  }

  async function resend(id: string) {
    setBusyId(id); setError('')
    try {
      await authRepository.resendInvite(id)
      setError('Письмо для установки пароля отправлено повторно.')
    }
    catch (error) { setError(error instanceof Error ? error.message : 'Не удалось отправить приглашение') }
    finally { setBusyId(null) }
  }

  async function toggleAccess(item: RegistrationRequest) {
    const block = window.confirm(`Изменить доступ семьи ${item.name}?`)
    if (!block) return
    setBusyId(item.id); setError('')
    try { await authRepository.setFamilyActive(item.id, false); setError('Доступ семьи заблокирован.') }
    catch (error) { setError(error instanceof Error ? error.message : 'Не удалось изменить доступ') }
    finally { setBusyId(null) }
  }

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
        <div className="card">
          <h2 className="card__title">Заявки семей</h2>
          {error && <p className="muted">{error}</p>}
          {requests.length === 0 && <p className="muted">Заявок пока нет.</p>}
          {requests.map(item => <div className="admin-request" key={item.id}>
            <div><strong>{item.name}</strong><br /><span>{item.email}</span><br /><small>{item.status}</small></div>
            {item.status === 'pending' && <div className="admin-request__actions">
              <BigButton disabled={busyId === item.id} onClick={() => review(item.id, 'approve')}>Одобрить</BigButton>
              <BigButton variant="ghost" disabled={busyId === item.id} onClick={() => review(item.id, 'reject')}>Отклонить</BigButton>
            </div>}
            {item.status === 'approved' && <div className="admin-request__actions">
              <BigButton disabled={busyId === item.id} onClick={() => resend(item.id)}>Повторить приглашение</BigButton>
              <BigButton variant="ghost" disabled={busyId === item.id} onClick={() => toggleAccess(item)}>Заблокировать</BigButton>
            </div>}
          </div>)}
        </div>
        <BigButton variant="soft" full onClick={() => navigate('/')}>Вернуться в приложение</BigButton>
        <BigButton variant="ghost" full onClick={signOut}>Выйти</BigButton>
      </div>
    </div>
  )
}
