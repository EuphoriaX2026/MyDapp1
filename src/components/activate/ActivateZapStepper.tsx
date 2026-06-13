import { AppIcon } from '../icons/AppIcon';
import React, { useEffect, useState } from 'react';
import type { ZapStep } from '../../hooks/useActivationZap';
import { EXECUTION_STATUS } from './ActivateTxProgressBar';

const RETRY_COOLDOWN_SECONDS = 5;

export interface ActivateZapStepperProps {
  steps: ZapStep[];
  isProcessing: boolean;
  isComplete: boolean;
  onRetry: (stepId: ZapStep['id']) => void;
}

function stepIcon(status: ZapStep['status']) {
  switch (status) {
    case 'success':
      return <AppIcon icon="lucide:circle-check" className="h-5 w-5 shrink-0" style={{ color: EXECUTION_STATUS.success }} />;
    case 'failed':
      return <AppIcon icon="lucide:circle-x" className="h-5 w-5 shrink-0" style={{ color: EXECUTION_STATUS.failed }} />;
    case 'processing':
      return <AppIcon icon="lucide:loader-circle" className="h-5 w-5 shrink-0 animate-spin" style={{ color: EXECUTION_STATUS.pending }} />;
    default:
      return <AppIcon icon="lucide:circle" className="activate-flow-muted h-5 w-5 shrink-0" />;
  }
}

interface ZapStepRowProps {
  step: ZapStep;
  index: number;
  isProcessing: boolean;
  onRetry: (stepId: ZapStep['id']) => void;
}

function ZapStepRow({ step, index, isProcessing, onRetry }: ZapStepRowProps) {
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (step.status !== 'failed') {
      setCooldown(0);
      return;
    }

    setCooldown(RETRY_COOLDOWN_SECONDS);

    const interval = window.setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [step.status, step.failCount]);

  const retryDisabled = isProcessing || cooldown > 0;
  const retryLabel = cooldown > 0 ? `Wait ${cooldown}s...` : 'Try';

  return (
    <div className="flex flex-col gap-1 rounded-xl border border-white/30 bg-white/10 px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        {stepIcon(step.status)}
        <div className="flex flex-1 flex-col">
          <span className="activate-zap-step-label activate-flow-text text-[14px]">
            {index + 1}. {step.label}
          </span>
          {step.status === 'failed' && (
            <span className="text-[12px]" style={{ color: EXECUTION_STATUS.failed }}>
              Transaction rejected — tap Try to retry
            </span>
          )}
        </div>
        {step.status === 'failed' && (
          <button
            type="button"
            className="btn btn-sm btn-primary activate-continue-btn px-3 py-1"
            onClick={() => onRetry(step.id)}
            disabled={retryDisabled}
          >
            {retryLabel}
          </button>
        )}
      </div>
      {step.hash && (
        <p className="activate-flow-muted truncate pl-7 font-mono text-[11px]">{step.hash}</p>
      )}
    </div>
  );
}

export function ActivateZapStepper({
  steps,
  isProcessing,
  isComplete,
  onRetry,
}: ActivateZapStepperProps) {
  return (
    <div className="flex flex-col gap-2">
      {steps.map((step, index) => (
        <ZapStepRow
          key={step.id}
          step={step}
          index={index}
          isProcessing={isProcessing}
          onRetry={onRetry}
        />
      ))}

      {isComplete && (
        <p
          className="activate-flow-text mt-1 text-center text-[14px]"
          style={{ color: EXECUTION_STATUS.success }}
        >
          Activation complete — E1 cashback received and package activated.
        </p>
      )}
    </div>
  );
}
