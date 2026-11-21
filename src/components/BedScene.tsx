import { useId } from 'react'
import type { Letter } from '../data/letters'
import { Plant } from './Plant'

const AR_FONT =
  "'Sakkal Majalla', 'Noto Naskh Arabic', 'Amiri', 'Segoe UI', Tahoma, serif"

interface Props {
  letter: Letter
  learned: boolean
  plantColor?: string
}

/**
 * Грядка как единая SVG-сцена (viewBox 0 0 120 150):
 *   - буква по центру (главный элемент),
 *   - выучена: цветок-значок в левом верхнем углу, звезда в правом,
 *   - не выучена: маленький росток в левом верхнем углу.
 * Всё в одной системе координат — ничего не «разъезжается».
 */
export function BedScene({ letter, learned, plantColor = '#e58a8a' }: Props) {
  const raw = useId().replace(/:/g, '')
  const soilId = `soil-${raw}`
  const glowId = `glow-${raw}`

  return (
    <svg viewBox="0 0 120 150" className="bed__scene" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={soilId} cx="50%" cy="18%" r="85%">
          <stop offset="0%" stopColor="#d8ae7c" />
          <stop offset="60%" stopColor="#b98a5c" />
          <stop offset="100%" stopColor="#94633c" />
        </radialGradient>
        <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff4c8" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fff4c8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* мягкий ореол, если буква выучена */}
      {learned && <circle cx="60" cy="80" r="56" fill={`url(#${glowId})`} />}

      {/* земля */}
      <ellipse cx="60" cy="127" rx="58" ry="18" fill={`url(#${soilId})`} />
      <ellipse cx="60" cy="121" rx="50" ry="12" fill="#d9b184" opacity="0.55" />

      {/* травинки */}
      <g stroke="#6ca355" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.9">
        <path d="M15 132 q 2 -9 1 -14" />
        <path d="M21 134 q 4 -8 7 -11" />
        <path d="M101 133 q -2 -9 -1 -15" />
        <path d="M107 135 q -4 -8 -8 -10" />
      </g>

      {/* цветок-значок (выучена) или росток (не выучена) */}
      {learned ? (
        <g transform="translate(4 6) scale(0.36)">
          <Plant asGroup color={plantColor} />
        </g>
      ) : (
        <g transform="translate(22 24)">
          <g stroke="#7fb069" strokeWidth="2.2" strokeLinecap="round" fill="none">
            <path d="M0 20 q 0 -11 0 -17" />
            <path d="M0 8 q -8 -1 -10 -7 q 8 0 10 7 Z" fill="#84b86a" stroke="none" />
            <path d="M0 4 q 8 -1 10 -7 q -8 0 -10 7 Z" fill="#84b86a" stroke="none" />
          </g>
        </g>
      )}

      {/* буква */}
      <text
        x="60"
        y="118"
        textAnchor="middle"
        fontFamily={AR_FONT}
        fontSize="56"
        fontWeight="600"
        fill={learned ? '#463424' : '#b7a68e'}
        style={{ direction: 'ltr' }}
      >
        {letter.char}
      </text>

      {/* звезда за успех */}
      {learned && (
        <path
          className="bed__star-svg"
          d="M101 28 l3.1 6.4 7 1 -5.1 4.9 1.2 7 -6.2-3.3 -6.2 3.3 1.2-7 -5.1-4.9 7-1 Z"
          fill="#f2b23c"
          stroke="#d99a2e"
          strokeWidth="1"
        />
      )}
    </svg>
  )
}