interface Props {
  label: string
  onUnlock: () => void
}

/**
 * Кнопка входа в родительский раздел.
 * Доступ к разделу дополнительно защищён авторизацией приложения.
 */
export function ParentGate({ label, onUnlock }: Props) {
  return (
    <button
      className="gate"
      onClick={onUnlock}
      type="button"
    >
      <span className="gate__label">{label}</span>
    </button>
  )
}
