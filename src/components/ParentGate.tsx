import { useEffect, useRef, useState, type CSSProperties } from 'react'

interface Props {
  label: string
  holdLabel: string
  onUnlock: () => void
  /** Время удержания, мс */
  duration?: number
}

/**
 * «Замок для родителей»: чтобы войти в настройки, нужно удерживать кнопку.
 * Малыш случайно не откроет настройки.
 */
export function ParentGate({ label, holdLabel, onUnlock, duration = 1500 }: Props) {
  const [progress, setProgress] = useState(0)
  const [holding, setHolding] = useState(false)
  const raf = useRef<number | null>(null)
  const start = useRef<number>(0)

  useEffect(() => {
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [])

  function tick() {
    const elapsed = performance.now() - start.current
    const p = Math.min(1, elapsed / duration)
    setProgress(p)
    if (p >= 1) {
      setHolding(false)
      setProgress(0)
      onUnlock()
      return
    }
    raf.current = requestAnimationFrame(tick)
  }

  function begin() {
    setHolding(true)
    start.current = performance.now()
    if (raf.current) cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(tick)
  }

  function end() {
    setHolding(false)
    setProgress(0)
    if (raf.current) cancelAnimationFrame(raf.current)
  }

  return (
    <button
      className={`gate ${holding ? 'gate--holding' : ''}`}
      onPointerDown={begin}
      onPointerUp={end}
      onPointerLeave={end}
      onPointerCancel={end}
      type="button"
    >
      <span className="gate__ring" style={{ '--p': progress } as CSSProperties} />
      <span className="gate__label">{holding ? holdLabel : label}</span>
    </button>
  )
}