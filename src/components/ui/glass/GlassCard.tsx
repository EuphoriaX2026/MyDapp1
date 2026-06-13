import React from 'react'

const GLOW_PRESETS: Record<string, string> = {
  pink: 'rgba(219, 44, 245, 0.35)',
  blue: 'rgba(78, 135, 255, 0.35)',
  indigo: 'rgba(74, 37, 225, 0.30)',
  none: 'transparent',
}

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Preset name or any valid CSS color for the radial vibrancy glow */
  glowColor?: keyof typeof GLOW_PRESETS | (string & {})
  children: React.ReactNode
}

export function GlassCard({
  glowColor,
  className = '',
  children,
  ...props
}: GlassCardProps) {
  const resolvedGlow =
    glowColor === undefined
      ? undefined
      : GLOW_PRESETS[glowColor] ?? glowColor

  return (
    <div className={`relative ${className}`.trim()} {...props}>
      {resolvedGlow && resolvedGlow !== 'transparent' && (
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] opacity-50 blur-3xl"
          style={{
            background: `radial-gradient(circle at 50% 40%, ${resolvedGlow} 0%, transparent 70%)`,
          }}
        />
      )}
      <div className="glass-panel">{children}</div>
    </div>
  )
}

export default GlassCard
