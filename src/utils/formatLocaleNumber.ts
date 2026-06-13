import {
  formatFinancialAmountParts,
  formatFinancialNumber,
  formatErxPrice as formatErxPriceValue,
} from './formatNumber';

/** @deprecated Use comma from en-US formatting */
export const THOUSAND_SEP_CHAR = ',';

/** Project default: en-US grouping, 2 decimal places. */
export function formatLocaleNumber(
  value: number | string,
  options?: { maxFractionDigits?: number; minFractionDigits?: number },
): string {
  return formatFinancialNumber(value, {
    minimumFractionDigits: options?.minFractionDigits ?? 0,
    maximumFractionDigits: options?.maxFractionDigits ?? 2,
  });
}

/** Token / balance amounts — always 2 decimals unless overridden. */
export function formatTokenAmount(
  value: number,
  options?: { maxFractionDigits?: number; minFractionDigits?: number },
): string {
  if (!Number.isFinite(value)) {
    return formatFinancialNumber(0, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return formatFinancialNumber(value, {
    minimumFractionDigits: options?.minFractionDigits ?? 2,
    maximumFractionDigits: options?.maxFractionDigits ?? 2,
  });
}

/** ERX USD price only — up to 6 decimals. */
export function formatErxPrice(value: number | string): string {
  return formatErxPriceValue(value);
}

export interface AmountParts {
  integerGroups: string[];
  decimal: string | null;
}

export function formatAmountParts(
  value: number | string,
  options?: { maxFractionDigits?: number; minFractionDigits?: number },
): AmountParts {
  const parts = formatFinancialAmountParts(value, {
    minimumFractionDigits: options?.minFractionDigits ?? 2,
    maximumFractionDigits: options?.maxFractionDigits ?? 2,
  });
  return {
    integerGroups: parts.integerFormatted.split(','),
    decimal: parts.decimal,
  };
}

export function shortenWalletAddress(addr: string) {
  if (addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
