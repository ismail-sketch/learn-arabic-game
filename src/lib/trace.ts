/**
 * Оценка обводки буквы пальцем.
 *
 * `body` буквы — это путь в системе viewBox 0 0 320 320.
 * Мы сэмплируем его в точки-ориентиры, а затем сравниваем с тем,
 * что нарисовал ребёнок. Оценка мягкая: важно «провести по букве»,
 * а не идеальная каллиграфия.
 */

export interface Pt {
  x: number
  y: number
}

/** Сэмплирует SVG-путь в набор точек */
export function samplePath(d: string, count: number): Pt[] {
  if (typeof document === 'undefined') return []
  const ns = 'http://www.w3.org/2000/svg'
  const path = document.createElementNS(ns, 'path') as SVGPathElement
  path.setAttribute('d', d)

  const svg = document.createElementNS(ns, 'svg')
  svg.style.position = 'absolute'
  svg.style.width = '0'
  svg.style.height = '0'
  svg.style.pointerEvents = 'none'
  svg.appendChild(path)
  document.body.appendChild(svg)

  let pts: Pt[] = []
  try {
    const len = path.getTotalLength()
    for (let i = 0; i <= count; i++) {
      const p = path.getPointAtLength((len * i) / count)
      pts.push({ x: p.x, y: p.y })
    }
  } finally {
    document.body.removeChild(svg)
  }
  return pts
}

export interface TraceResult {
  /** Доля ориентиров, рядом с которыми прошёл палец (0..1) */
  coverage: number
  /** Отношение длины следа к длине буквы */
  lengthRatio: number
}

function dist(a: Pt, b: Pt): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function evaluateTrace(guide: Pt[], strokes: Pt[][], tol: number): TraceResult {
  const user = strokes.flat()
  if (user.length < 5 || guide.length === 0) {
    return { coverage: 0, lengthRatio: 0 }
  }

  const tol2 = tol * tol
  let covered = 0
  for (const g of guide) {
    for (const u of user) {
      const dx = g.x - u.x
      const dy = g.y - u.y
      if (dx * dx + dy * dy <= tol2) {
        covered++
        break
      }
    }
  }
  const coverage = covered / guide.length

  let userLen = 0
  for (const stroke of strokes) {
    for (let i = 1; i < stroke.length; i++) userLen += dist(stroke[i], stroke[i - 1])
  }
  let guideLen = 0
  for (let i = 1; i < guide.length; i++) guideLen += dist(guide[i], guide[i - 1])
  const lengthRatio = guideLen > 0 ? userLen / guideLen : 0

  return { coverage, lengthRatio }
}

/** Порог успеха и допуск в единицах viewBox зависят от возрастной дорожки */
export function traceRules(track: 'sprout' | 'flower' | 'tree'): {
  coverage: number
  tol: number
} {
  switch (track) {
    case 'sprout':
      return { coverage: 0.45, tol: 38 }
    case 'flower':
      return { coverage: 0.6, tol: 30 }
    case 'tree':
      return { coverage: 0.72, tol: 24 }
  }
}

export function isTraceSuccess(
  result: TraceResult,
  track: 'sprout' | 'flower' | 'tree'
): boolean {
  const rules = traceRules(track)
  return (
    result.coverage >= rules.coverage &&
    result.lengthRatio >= 0.4 &&
    result.lengthRatio <= 4
  )
}