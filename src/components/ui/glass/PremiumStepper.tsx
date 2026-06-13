import React from 'react'
import { AppIcon } from '../../icons/AppIcon'

interface PremiumStepperProps {
  /** Register wizard: 1 = Connect | 2 = Sponsor | 3 = Review | 4 = Active */
  currentStep: number
  className?: string
  /** Tighter circles, labels, and spacing for narrow columns (e.g. Register 480px) */
  compact?: boolean
}

type StepVisualStatus = 'completed' | 'active' | 'inactive'

const STEPS = [
  { label: 'Connect Wallet', icon: 'lucide:wallet' },
  { label: 'Sponsor', icon: 'lucide:user-plus' },
  { label: 'Review', icon: 'lucide:file-text' },
  { label: 'Active', icon: 'lucide:zap' },
] as const

function getStepStatus(index: number, currentStep: number): StepVisualStatus {
  if (currentStep > index + 1) return 'completed'
  if (currentStep === index + 1) return 'active'
  return 'inactive'
}

function progressWidth(currentStep: number): string {
  if (currentStep <= 1) return '0%'
  if (currentStep === 2) return '33.33%'
  if (currentStep === 3) return '66.66%'
  return '100%'
}

function StepIcon({
  icon,
  color,
  size,
}: {
  icon: string
  color: string
  size: string
}) {
  return <AppIcon icon={icon} style={{ fontSize: size, color }} aria-hidden="true" />
}

export function PremiumStepper({ currentStep, className = '', compact = false }: PremiumStepperProps) {
  const progress = progressWidth(currentStep)
  const trackTop = compact ? 'top-[26px] ' : 'top-[34px]'
  const dashWidth = compact ? 'w-4 ' : 'w-8'

  return (
    <div
      className={`relative mx-auto flex w-full max-w-full items-center justify-center px-0.5  ${compact ? 'mb-5 ' : 'mb-10'} ${className}`.trim()}
    >
      {/* Progress track — 4px thick, recessed 3D groove */}
      <div className={`absolute left-0 right-0 z-0 flex items-center px-0.5  ${trackTop}`}>
        <div className={`h-0 shrink-0 border-t-[3px] border-dashed border-gray-400/50 ${dashWidth}`} />
        <div className="relative mx-1 h-[4px] flex-1">
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-b from-gray-200 to-gray-300/90 shadow-[inset_0_2px_5px_rgba(0,0,0,0.14),inset_0_-1px_2px_rgba(255,255,255,0.65)]"
            aria-hidden
          />
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-brand-blue via-[#7b5cff] to-brand-pink shadow-[0_2px_6px_rgba(78,135,255,0.45),0_1px_3px_rgba(219,44,245,0.4),inset_0_1px_0_rgba(255,255,255,0.45)] transition-all duration-700 ease-in-out"
            style={{ width: progress }}
            aria-hidden
          />
        </div>
        <div className={`h-0 shrink-0 border-t-[3px] border-dashed border-gray-400/50 ${dashWidth}`} />
      </div>

      {/* Steps */}
      <div className="relative z-10 flex w-full justify-between gap-0.5">
        {STEPS.map(({ label, icon }, index) => {
          const status = getStepStatus(index, currentStep)
          const isCompleted = status === 'completed'
          const isActive = status === 'active'
          const isInactive = status === 'inactive'

          const iconColor = isCompleted ? '#4E87FF' : isActive ? '#DB2CF5' : '#9CA3AF'
          const circleSize = compact
            ? isActive
              ? 'h-[48px] w-[48px]  '
              : 'h-[42px] w-[42px]  '
            : isActive
              ? 'h-[62px] w-[62px]'
              : 'h-[54px] w-[54px]'
          const iconSize = compact
            ? isActive
              ? '22px'
              : '20px'
            : isActive
              ? '28px'
              : '24px'
          const labelMax = compact ? 'max-w-[56px] ' : 'max-w-[72px]'

          return (
            <div
              key={label}
              className={`relative flex flex-col items-center gap-2 ${isInactive ? 'opacity-80' : ''}`}
            >
              {isCompleted && (
                <div className="absolute inset-0 -z-10 scale-150 rounded-full bg-brand-blue/20 blur-xl" />
              )}

              {isActive && (
                <div className="absolute inset-0 -z-10 scale-125 rounded-full bg-brand-pink/15 blur-xl" aria-hidden />
              )}

              <div
                className={`neumorphic-pop flex items-center justify-center rounded-full ${circleSize} ${
                  isActive
                    ? 'border-2 border-brand-pink/20 shadow-[0_0_20px_rgba(219,44,245,0.35)]'
                    : ''
                }`}
              >
                <StepIcon icon={icon} color={iconColor} size={iconSize} />
              </div>

              {isCompleted ? (
                <div className={`mt-0.5 flex ${labelMax} items-center justify-center gap-0.5`}>
                  <StepIcon icon="lucide:check" color="#4E87FF" size={compact ? '12px' : '14px'} />
                  <span
                    className={`text-center font-medium uppercase tracking-wider leading-tight text-gray-500 ${compact ? 'text-[9px] ' : 'text-[10px]'}`}
                  >
                    {label}
                  </span>
                </div>
              ) : isActive ? (
                <span
                  className={`${labelMax} text-center font-black leading-tight tracking-wide text-brand-surface-dark ${compact ? 'text-[10px] ' : 'text-[11px]'}`}
                >
                  {label}
                </span>
              ) : (
                <span
                  className={`${labelMax} text-center font-medium leading-tight tracking-wide text-gray-400 ${compact ? 'text-[9px] ' : 'text-[10px]'}`}
                >
                  {label}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PremiumStepper
