/**
 * Обводка буквы пальцем.
 *
 * Буква рисуется по точному контуру (`letterShapes[id].outline`) в системе
 * viewBox 0 0 320 320. Из этого же контура строится маска: точки-ориентиры
 * внутри буквы и подсказка «начни здесь». Ребёнок ведёт палец по букве —
 * успех засчитывается только когда обведена ВСЯ буква (все точки-ориентиры,
 * включая точки над буквами) и при этом палец не размазан по всей доске.
 * Частично обведённая буква не завершает упражнение: оставшиеся участки
 * показываются ребёнку точками.
 *
 * Мягким осталось только попадание в саму букву (допуск и доля следа на букве),
 * полнота обводки не смягчается ни на одной возрастной дорожке.
 */

import type { Track } from '../types'

export interface Pt {
  x: number
  y: number
}

/** Рабочая сетка маски совпадает с viewBox буквы */
const VIEW = 320

export interface LetterMask {
  /** Точки-ориентиры внутри буквы (сетка с шагом ~7 единиц) */
  guide: Pt[]
  /** Подсказка, откуда начать (правый верхний край буквы) */
  start: Pt | null
}

function emptyMask(): LetterMask {
  return { guide: [], start: null }
}

/**
 * Строит маску по контуру буквы: заливает контур на скрытом canvas
 * (правило заливки even-odd, как в SVG) и собирает внутренние точки.
 * Требует DOM; вне браузера возвращает пустую маску.
 */
export function buildLetterMask(outline: string, step = 7): LetterMask {
  if (typeof document === 'undefined') return emptyMask()

  const canvas = document.createElement('canvas')
  canvas.width = VIEW
  canvas.height = VIEW
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return emptyMask()

  let path: Path2D
  try {
    path = new Path2D(outline)
  } catch {
    return emptyMask()
  }

  ctx.clearRect(0, 0, VIEW, VIEW)
  ctx.fillStyle = '#000'
  ctx.fill(path, 'evenodd')

  let data: Uint8ClampedArray
  try {
    data = ctx.getImageData(0, 0, VIEW, VIEW).data
  } catch {
    return emptyMask()
  }

  const alphaAt = (x: number, y: number): boolean => {
    const px = x | 0
    const py = y | 0
    if (px < 0 || py < 0 || px >= VIEW || py >= VIEW) return false
    return data[(py * VIEW + px) * 4 + 3] > 127
  }

  const guide: Pt[] = []
  for (let y = step / 2; y < VIEW; y += step) {
    for (let x = step / 2; x < VIEW; x += step) {
      if (alphaAt(x, y)) guide.push({ x, y })
    }
  }

  let start: Pt | null = null
  if (guide.length) {
    let minY = Infinity
    let maxY = -Infinity
    for (const p of guide) {
      minY = Math.min(minY, p.y)
      maxY = Math.max(maxY, p.y)
    }
    const upperHalf = guide.filter((p) => p.y <= (minY + maxY) / 2)
    // Арабскую букву начинают справа сверху. У ع и غ самый правый край —
    // конец хвоста внизу, поэтому сначала ищем правый край в верхней половине.
    const candidates = upperHalf.length ? upperHalf : guide
    let maxX = -Infinity
    for (const p of candidates) maxX = Math.max(maxX, p.x)
    for (const p of candidates) {
      if (p.x < maxX - step) continue
      if (!start || p.y < start.y) start = p
    }
  }

  return { guide, start }
}

export interface TraceResult {
  /** Доля ориентиров буквы, рядом с которыми прошёл палец (0..1) */
  coverage: number
  /** Доля точек следа, которые легли на букву (0..1) */
  onLetter: number
  /** Длина нарисованного пути в единицах viewBox */
  length: number
  /** Ориентиры, которые ребёнок ещё не обвёл — для подсказки на доске */
  remaining: Pt[]
}

function dist(a: Pt, b: Pt): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function evaluateTrace(
  mask: LetterMask,
  strokes: Pt[][],
  tol: number
): TraceResult {
  const guide = mask.guide
  const user = strokes.flat()
  if (user.length < 2 || guide.length === 0) {
    return { coverage: 0, onLetter: 0, length: 0, remaining: guide.slice() }
  }

  const tol2 = tol * tol

  // насколько обведена сама буква; непройденные ориентиры пригодятся
  // для подсказки, что ещё осталось обвести
  let covered = 0
  const remaining: Pt[] = []
  for (const g of guide) {
    let hit = false
    for (const u of user) {
      const dx = g.x - u.x
      const dy = g.y - u.y
      if (dx * dx + dy * dy <= tol2) {
        hit = true
        break
      }
    }
    if (hit) covered++
    else remaining.push(g)
  }
  const coverage = covered / guide.length

  // насколько аккуратно: точки следа должны лежать на букве
  let near = 0
  for (const u of user) {
    for (const g of guide) {
      const dx = g.x - u.x
      const dy = g.y - u.y
      if (dx * dx + dy * dy <= tol2) {
        near++
        break
      }
    }
  }
  const onLetter = near / user.length

  let length = 0
  for (const stroke of strokes) {
    for (let i = 1; i < stroke.length; i++) length += dist(stroke[i], stroke[i - 1])
  }

  return { coverage, onLetter, length, remaining }
}

/**
 * Правила успеха зависят от возрастной дорожки.
 *
 * `coverage` — всегда 1: буква считается обведённой, только когда пройдены
 * все её ориентиры (тело буквы и точки над ней). Дорожка меняет лишь допуск
 * и аккуратность: малышам прощают более широкий след, старшим — более узкий.
 *
 * `onLetter` — доля следа, который прошёл по букве. Она не даёт «нарисовать
 * зигзаг по всей доске»: при обводке другой буквы эта доля ~0.96–1.0,
 * а при случайном зигзаге — около 0.2–0.6.
 */
export function traceRules(track: Track): {
  coverage: number
  tol: number
  onLetter: number
} {
  switch (track) {
    case 'sprout':
      return { coverage: 1, tol: 40, onLetter: 0.55 }
    case 'flower':
      return { coverage: 1, tol: 32, onLetter: 0.7 }
    case 'tree':
      return { coverage: 1, tol: 28, onLetter: 0.78 }
  }
}

export function isTraceSuccess(result: TraceResult, track: Track): boolean {
  const rules = traceRules(track)
  return (
    result.coverage >= rules.coverage &&
    result.onLetter >= rules.onLetter &&
    result.length >= 60
  )
}
