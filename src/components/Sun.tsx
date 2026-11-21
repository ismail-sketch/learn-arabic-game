import { useId } from 'react'

export type SunMood = 'idle' | 'happy' | 'hint'

interface Props {
  size?: number
  face?: boolean
  mood?: SunMood
  className?: string
}

/**
 * Солнышко-маскот. По умолчанию без лица — эмоции передаются светом.
 * Если в настройках включено лицо, появляется простая улыбка.
 */
export function Sun({ size = 96, face = false, mood = 'idle', className }: Props) {
  const gid = useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={`sun sun--${mood} ${className ?? ''}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={`sunFill-${gid}`} cx="42%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#ffe28c" />
          <stop offset="70%" stopColor="#f7c65e" />
          <stop offset="100%" stopColor="#efab3b" />
        </radialGradient>
      </defs>

      <g className="sun__rays" stroke="#f2b23c" strokeWidth="7" strokeLinecap="round">
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * Math.PI) / 6
          const x1 = 100 + Math.cos(a) * 66
          const y1 = 100 + Math.sin(a) * 66
          const x2 = 100 + Math.cos(a) * 84
          const y2 = 100 + Math.sin(a) * 84
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
        })}
      </g>

      <circle cx="100" cy="100" r="60" fill={`url(#sunFill-${gid})`} />

      {face && (
        <g className="sun__face" fill="none" stroke="#7a5320" strokeWidth="5" strokeLinecap="round">
          <circle cx="82" cy="92" r="4.5" fill="#7a5320" stroke="none" />
          <circle cx="118" cy="92" r="4.5" fill="#7a5320" stroke="none" />
          <path d="M82 116 Q100 130 118 116" />
          <circle cx="70" cy="108" r="6" fill="#f19b8a" stroke="none" opacity="0.6" />
          <circle cx="130" cy="108" r="6" fill="#f19b8a" stroke="none" opacity="0.6" />
        </g>
      )}
    </svg>
  )
}