import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import type { Letter } from '../data/letters'
import type { Track, UiLang } from '../types'
import { strings } from '../data/i18n'
import { playClip, speakSequence, type SpeechItem } from '../lib/audio'
import { useSpeak } from '../lib/useSpeak'
import { evaluateTrace, isTraceSuccess, samplePath, traceRules, type Pt } from '../lib/trace'
import { BigButton } from '../components/BigButton'
import { SpeakerButton } from '../components/SpeakerButton'
import { Plant } from '../components/Plant'

interface Props {
  letter: Letter
  track: Track
  lang: UiLang
  onComplete: () => void
}

function pointsAttr(points: Pt[]): string {
  return points.map((p) => `${p.x},${p.y}`).join(' ')
}

export function TraceLetter({ letter, track, lang, onComplete }: Props) {
  const t = strings[lang]
  const svgRef = useRef<SVGSVGElement | null>(null)
  const drawing = useRef(false)
  const liveRef = useRef<Pt[]>([])
  const strokesRef = useRef<Pt[][]>([])
  const [live, setLiveState] = useState<Pt[]>([])
  const [strokes, setStrokesState] = useState<Pt[][]>([])
  const [success, setSuccess] = useState(false)
  const [failed, setFailed] = useState(false)

  const guide = useMemo(() => samplePath(letter.body, 48), [letter.body])
  const rules = traceRules(track)

  const items: SpeechItem[] = [{ text: t.startTracing, lang, key: `instruction-trace-${lang}` }]
  useSpeak(`trace-${letter.id}`, items)

  function setLive(points: Pt[]) {
    liveRef.current = points
    setLiveState(points)
  }

  function setStrokes(next: Pt[][]) {
    strokesRef.current = next
    setStrokesState(next)
  }

  function toSvg(clientX: number, clientY: number): Pt {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const point = svg.createSVGPoint()
    point.x = clientX
    point.y = clientY
    const matrix = svg.getScreenCTM()
    if (!matrix) return { x: 0, y: 0 }
    const transformed = point.matrixTransform(matrix.inverse())
    return { x: transformed.x, y: transformed.y }
  }

  function addPoint(point: Pt) {
    const current = liveRef.current
    const last = current[current.length - 1]
    if (last && Math.hypot(point.x - last.x, point.y - last.y) < 3) return
    setLive([...current, point])
  }

  function start(e: ReactPointerEvent<SVGSVGElement>) {
    if (success) return
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* синтетические события могут не поддержать захват — не критично */
    }
    drawing.current = true
    setFailed(false)
    setLive([toSvg(e.clientX, e.clientY)])
  }

  function move(e: ReactPointerEvent<SVGSVGElement>) {
    if (!drawing.current || success) return
    addPoint(toSvg(e.clientX, e.clientY))
  }

  function finish(e: ReactPointerEvent<SVGSVGElement>) {
    if (!drawing.current || success) return
    drawing.current = false
    const lastPoint = toSvg(e.clientX, e.clientY)
    const stroke = [...liveRef.current, lastPoint]
    const next = [...strokesRef.current, stroke]
    setStrokes(next)
    setLive([])

    const result = evaluateTrace(guide, next, rules.tol)
    // Малышам (Росточек) достаточно просто поводить пальцем — не оцениваем.
    const ok =
      track === 'sprout'
        ? next.flat().length >= 4
        : isTraceSuccess(result, track)
    if (ok) {
      setSuccess(true)
      window.setTimeout(onComplete, 1200)
    } else {
      setFailed(true)
      playClip(`praise-again-${lang}`, { text: lang === 'ar' ? 'حاول مرّة أخرى' : 'Попробуй ещё раз', lang })
    }
  }

  function clear() {
    setStrokes([])
    setLive([])
    setFailed(false)
    setSuccess(false)
  }

  return (
    <div className="exercise trace-exercise">
      <SpeakerButton
        className="exercise__speaker"
        onSpeak={() => speakSequence(items)}
        label={t.listenAgain}
      />
      <h2 className="exercise__title">{t.traceTitle}</h2>
      <p className="exercise__hint">{t.startTracing}</p>

      <div className="trace-board">
        <svg
          ref={svgRef}
          viewBox="0 0 320 320"
          className="trace-svg"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={finish}
          onPointerCancel={finish}
          onPointerLeave={(e) => {
            if (drawing.current) move(e)
          }}
        >
          <path
            d={letter.body}
            fill="none"
            stroke="#dfcdb0"
            strokeWidth="34"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={letter.body}
            fill="none"
            stroke="#ae9473"
            strokeWidth="5"
            strokeDasharray="2 12"
            strokeLinecap="round"
          />
          {letter.dots.map((dot, i) => (
            <circle key={i} cx={dot.cx} cy={dot.cy} r={dot.r + 2} fill="#dfcdb0" />
          ))}
          {!strokes.length && !live.length && guide.length > 0 && (
            <circle
              className="trace-start"
              cx={guide[0].x}
              cy={guide[0].y}
              r="10"
              fill="#e58a8a"
            />
          )}
          {strokes.map((stroke, i) => (
            <polyline
              key={i}
              points={pointsAttr(stroke)}
              fill="none"
              stroke="#e58a8a"
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {live.length > 0 && (
            <polyline
              points={pointsAttr(live)}
              fill="none"
              stroke="#db6f75"
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
        {success && (
          <div className="trace-success">
            <Plant color="#e58a8a" />
            <strong>{t.wellDone}</strong>
          </div>
        )}
      </div>

      <div className="trace-footer">
        <span className={`trace-status ${failed ? 'trace-status--failed' : ''}`}>
          {failed ? t.tryAgain : `${letter.nameAr} · ${letter.nameRu}`}
        </span>
        <BigButton variant="soft" onClick={clear} type="button">
          {t.clear}
        </BigButton>
      </div>
    </div>
  )
}
