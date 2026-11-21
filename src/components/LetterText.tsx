import type { Letter } from '../data/letters'

interface Props {
  letter: Letter
  color?: string
  className?: string
}

/** Настоящая арабская буква, отрисованная шрифтом (а не грубым контуром). */
export function LetterText({ letter, color, className }: Props) {
  return (
    <span
      className={`letter-text ${className ?? ''}`}
      style={color ? { color } : undefined}
      lang="ar"
      dir="rtl"
      aria-hidden="true"
    >
      {letter.char}
    </span>
  )
}