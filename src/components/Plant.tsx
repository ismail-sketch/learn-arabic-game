import { useId } from 'react'

interface Props {
  /** Цвет лепестков */
  color?: string
  className?: string
  /**
   * Отрисовать содержимое как <g> вместо <svg> —
   * чтобы вкладывать растение в другой SVG (грядку) без рассогласования.
   */
  asGroup?: boolean
}

function shade(hex: string, factor = 0.78): string {
  const clean = hex.replace('#', '')
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean
  const n = parseInt(full, 16)
  const r = Math.round(((n >> 16) & 255) * factor)
  const g = Math.round(((n >> 8) & 255) * factor)
  const b = Math.round((n & 255) * factor)
  return `rgb(${r}, ${g}, ${b})`
}

/**
 * Цветок в единой системе координат viewBox 0 0 100 120:
 * стебель растёт снизу (50,116) прямо в центр венчика (50,40),
 * поэтому стебель и цветок всегда соединены.
 */
export function Plant({ color = '#e58a8a', className, asGroup = false }: Props) {
  const raw = useId().replace(/:/g, '')
  const stemId = `stem-${raw}`
  const petalId = `petal-${raw}`
  const coreId = `core-${raw}`

  const inner = (
    <>
      <defs>
        <linearGradient id={stemId} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#4f7a3a" />
          <stop offset="1" stopColor="#84b86a" />
        </linearGradient>
        <radialGradient id={petalId} cx="46%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="52%" stopColor={color} />
          <stop offset="100%" stopColor={shade(color)} />
        </radialGradient>
        <radialGradient id={coreId} cx="38%" cy="34%" r="72%">
          <stop offset="0%" stopColor="#ffe9a8" />
          <stop offset="100%" stopColor="#e6a437" />
        </radialGradient>
      </defs>

      {/* стебель: снизу в центр венчика */}
      <path
        d="M50 116 C 44 92 56 68 50 40"
        fill="none"
        stroke={`url(#${stemId})`}
        strokeWidth="4.6"
        strokeLinecap="round"
      />

      {/* листья, прикреплённые к стеблю */}
      <path d="M48.5 95 C 33 95 24 84 22 70 C 38 70 48.5 80 48.5 95 Z" fill="#6ca355" />
      <path d="M51.5 79 C 67 79 76 68 78 54 C 62 54 51.5 65 51.5 79 Z" fill="#84b86a" />
      <path d="M48.5 95 C 40 94 32 88 28 82" fill="none" stroke="#4f7a3a" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <path d="M51.5 79 C 60 78 70 70 73 61" fill="none" stroke="#4f7a3a" strokeWidth="1" strokeLinecap="round" opacity="0.5" />

      {/* венчик: внешняя группа задаёт позицию (конец стебля),
          внутренняя — только анимацию масштаба, чтобы CSS-transform
          не перекрывал translate и цветок не «уезжал» в угол */}
      <g transform="translate(50 40)">
        <g className="plant__bloom">
          {Array.from({ length: 6 }).map((_, i) => (
            <ellipse
              key={`p${i}`}
              cx="0"
              cy="-15"
              rx="8.6"
              ry="14"
              fill={`url(#${petalId})`}
              transform={`rotate(${i * 60})`}
            />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <ellipse
              key={`i${i}`}
              cx="0"
              cy="-10.5"
              rx="5"
              ry="9"
              fill="#ffffff"
              opacity="0.28"
              transform={`rotate(${i * 60 + 30})`}
            />
          ))}
          <circle r="9.4" fill={`url(#${coreId})`} />
          <g fill="#b97d22" opacity="0.55">
            {Array.from({ length: 7 }).map((_, i) => {
              const a = (i * Math.PI) / 3.5
              return <circle key={`d${i}`} cx={Math.cos(a) * 4.6} cy={Math.sin(a) * 4.6} r="1.15" />
            })}
          </g>
        </g>
      </g>
    </>
  )

  if (asGroup) {
    return <g className={`plant plant--group ${className ?? ''}`}>{inner}</g>
  }

  return (
    <svg viewBox="0 0 100 120" className={`plant ${className ?? ''}`} aria-hidden="true" focusable="false">
      {inner}
    </svg>
  )
}