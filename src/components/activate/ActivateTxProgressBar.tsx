import { useEffect, useState } from 'react';

type ActivateTxProgressBarProps = {
  percent: number;
  color: string;
  visible: boolean;
};

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized;
  const int = Number.parseInt(full, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function ActivateTxProgressBar({ percent, color, visible }: ActivateTxProgressBarProps) {
  if (!visible) return null;

  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div className="activate-tx-progress" aria-hidden={clamped === 0}>
      <div
        className="activate-tx-progress-bar"
        style={{
          width: `${clamped}%`,
          background: `linear-gradient(90deg, ${hexToRgba(color, 0.75)} 0%, ${color} 55%, ${hexToRgba(color, 0.92)} 100%)`,
          boxShadow: `0 0 10px ${hexToRgba(color, 0.55)}, 0 0 22px ${hexToRgba(color, 0.32)}`,
        }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}

/** Slowly advance progress while a wallet signature is in flight (caps before completion). */
export function useTxProgressTicker(active: boolean, txId: string | null) {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    if (!active || !txId) {
      setPercent(0);
      return;
    }

    setPercent(0);
    const interval = window.setInterval(() => {
      setPercent((prev) => (prev >= 92 ? prev : prev + 1.8));
    }, 120);

    return () => window.clearInterval(interval);
  }, [active, txId]);

  return percent;
}

/** Approve bar + cycling buy-transaction neon colors. */
export const EXECUTION_APPROVE_COLOR = '#05D0A4';

export const EXECUTION_BUY_COLORS = [
  '#FF396F',
  '#4E87FF',
  '#DB2CF5',
  '#FFB400',
  '#1DCC70',
  '#8494A8',
  '#05D0A4',
] as const;

export function getExecutionBarColor(txId: string, orderedIds: string[]): string {
  if (txId === 'approve-spend') return EXECUTION_APPROVE_COLOR;
  const buyIds = orderedIds.filter((id) => id !== 'approve-spend');
  const index = buyIds.indexOf(txId);
  if (index < 0) return EXECUTION_BUY_COLORS[0];
  return EXECUTION_BUY_COLORS[index % EXECUTION_BUY_COLORS.length];
}

export const EXECUTION_STATUS = {
  pending: '#FFB400',
  success: '#05D0A4',
  failed: '#FF396F',
} as const;
