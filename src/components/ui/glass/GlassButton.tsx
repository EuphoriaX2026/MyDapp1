import React from 'react'

export type GlassButtonVariant = 'primary' | 'secondary' | 'icon' | 'liquid-blue'

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: GlassButtonVariant
  children: React.ReactNode
}

const variantClasses: Record<GlassButtonVariant, string> = {
  primary:
    'bg-white/20 text-brand-surface-dark font-bold before:bg-glass-gradient-brand before:opacity-80',
  secondary:
    'bg-white/10 text-brand-surface-dark font-medium hover:bg-white/20',
  icon: 'bg-white/15 text-brand-surface-dark p-0 aspect-square',
  'liquid-blue':
    '!bg-gradient-to-b !from-[#4faaff] !to-[#0062e6] !text-white font-bold tracking-wide shadow-[0_12px_24px_-8px_rgba(0,98,230,0.6),inset_0_-4px_8px_rgba(0,30,100,0.4),inset_0_4px_8px_rgba(255,255,255,0.4)] before:absolute before:top-[2px] before:left-[4%] before:right-[4%] before:h-[35%] before:rounded-full before:bg-gradient-to-b before:from-white/70 before:to-transparent before:pointer-events-none !rounded-full !border-none',
}

export function GlassButton({
  variant = 'primary',
  className = '',
  children,
  type = 'button',
  ...props
}: GlassButtonProps) {
  const usesBeforeGlow = variant === 'primary' || variant === 'secondary'
  const isLiquid = variant === 'liquid-blue'

  return (
    <button
      type={type}
      className={[
        isLiquid
          ? 'relative inline-flex items-center justify-center transition-transform duration-200 ease-out active:scale-95'
          : 'glass-button',
        usesBeforeGlow &&
          'before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit]',
        variantClasses[variant],
        variant === 'icon' ? 'min-h-[44px] min-w-[44px] rounded-2xl' : 'px-5 py-3',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <span className="relative z-10 inline-flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  )
}

export default GlassButton
