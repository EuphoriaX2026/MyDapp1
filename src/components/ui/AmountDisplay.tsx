import React from 'react';
import { formatFinancialAmountParts } from '../../utils/formatNumber';

export interface AmountDisplayProps {
  value: number | string;
  className?: string;
  decimalClassName?: string;
  maxFractionDigits?: number;
  minFractionDigits?: number;
}

/** Comma-grouped financial amount (12,345.6789) — Inter Bold via `.financial-amount`. */
export const AmountDisplay: React.FC<AmountDisplayProps> = ({
  value,
  className = '',
  decimalClassName = 'text-[0.58em] font-bold align-baseline opacity-85',
  maxFractionDigits = 2,
  minFractionDigits = 2,
}) => {
  const { integerFormatted, decimal } = formatFinancialAmountParts(value, {
    maxFractionDigits,
    minFractionDigits,
  });

  return (
    <span className={`tabular-nums financial-amount ${className}`}>
      {integerFormatted}
      {decimal != null && (
        <>
          <span className="opacity-90">.</span>
          <span className={decimalClassName}>{decimal}</span>
        </>
      )}
    </span>
  );
};
