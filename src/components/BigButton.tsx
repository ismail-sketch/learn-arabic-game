import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'soft' | 'ghost'
  size?: 'md' | 'lg'
  full?: boolean
}

export function BigButton({
  children,
  variant = 'primary',
  size = 'md',
  full = false,
  className,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      className={`btn btn--${variant} btn--${size} ${full ? 'btn--full' : ''} ${className ?? ''}`}
    >
      {children}
    </button>
  )
}