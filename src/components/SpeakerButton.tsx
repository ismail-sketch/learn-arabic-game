interface Props {
  onSpeak: () => void
  label?: string
  className?: string
}

/** Кнопка-динамик: повторить голосовую подсказку. */
export function SpeakerButton({ onSpeak, label, className }: Props) {
  return (
    <button
      type="button"
      className={`speaker ${className ?? ''}`}
      onClick={onSpeak}
      aria-label={label ?? 'Послушать'}
    >
      <span aria-hidden="true">🔊</span>
    </button>
  )
}