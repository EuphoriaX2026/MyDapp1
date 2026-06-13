/**
 * Formats numbers with "." as the thousands separator (e.g. 10000 → "10.000,00").
 * Uses de-DE locale: thousands ".", decimals ",".
 */
export function formatDotNumber(
  value: number,
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number }
): string {
  const minimumFractionDigits = options?.minimumFractionDigits ?? 2;
  const maximumFractionDigits = options?.maximumFractionDigits ?? 2;

  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
}

/** True when value has no meaningful fractional part (e.g. 10.00 → whole). */
export function isWholeAmount(value: number): boolean {
  return Math.abs(value - Math.round(value)) < 1e-9;
}

/**
 * Dot-grouped number — omits decimals for whole amounts (10 → "10", 10.5 → "10,50").
 */
export function formatDotNumberSmart(value: number): string {
  const whole = isWholeAmount(value);
  return formatDotNumber(value, {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  });
}

/** Currency with smart decimals (e.g. "$10" or "$10,50"). */
export function formatUsdSmart(value: number): string {
  return `$${formatDotNumberSmart(value)}`;
}

/** Plain amount with smart decimals — for E1 totals without currency prefix. */
export function formatAmountSmart(value: number): string {
  return formatDotNumberSmart(value);
}

/** Currency prefix with dot-grouped amount (e.g. "$10.000,00"). */
export function formatUsd(
  value: number,
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number }
): string {
  return `$${formatDotNumber(value, options)}`;
}

/**
 * Financial display — en-US comma thousands, dot decimals (e.g. 12,345.6789).
 * Used for profile/wallet balances and swap card amounts.
 */
export function formatFinancialNumber(
  value: number | string,
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number },
): string {
  const num =
    typeof value === 'string'
      ? parseFloat(value.replace(/[^0-9.-]/g, ''))
      : value;

  if (!Number.isFinite(num)) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: options?.minimumFractionDigits ?? 2,
      maximumFractionDigits: options?.maximumFractionDigits ?? 2,
    }).format(0);
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: options?.minimumFractionDigits ?? 2,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  }).format(num);
}

/** USD with financial pattern (e.g. "$12,345.6789"). */
export function formatFinancialUsd(
  value: number | string,
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number },
): string {
  const num =
    typeof value === 'string'
      ? parseFloat(value.replace(/[^0-9.-]/g, ''))
      : value;

  if (!Number.isFinite(num)) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: options?.minimumFractionDigits ?? 2,
      maximumFractionDigits: options?.maximumFractionDigits ?? 2,
    }).format(0);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: options?.minimumFractionDigits ?? 2,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  }).format(num);
}

export interface FinancialAmountParts {
  integerFormatted: string;
  decimal: string | null;
}

/** Wallet hero balance — decimal places by USD tier. */
export function getWalletBalanceFractionDigits(value: number): number {
  const abs = Math.abs(value);
  if (abs > 10000) return 0;
  if (abs > 1000) return 1;
  return 2;
}

/** Split financial amount for styled integer / decimal rendering. */
export function formatFinancialAmountParts(
  value: number | string,
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number },
): FinancialAmountParts {
  const num =
    typeof value === 'string'
      ? parseFloat(value.replace(/[^0-9.-]/g, ''))
      : value;

  const minFd = options?.minimumFractionDigits ?? 2;
  const maxFd = options?.maximumFractionDigits ?? 2;

  if (!Number.isFinite(num)) {
    return { integerFormatted: '0', decimal: '0'.padEnd(minFd, '0') };
  }

  const parts = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: minFd,
    maximumFractionDigits: maxFd,
  }).formatToParts(num);

  let integerFormatted = '';
  let decimal: string | null = null;

  for (const part of parts) {
    if (part.type === 'integer' || part.type === 'group') {
      integerFormatted += part.value;
    } else if (part.type === 'fraction') {
      decimal = part.value;
    }
  }

  return { integerFormatted, decimal };
}

/** Strip grouping commas; keep digits and at most one decimal point. */
export function sanitizeFinancialAmountInput(value: string, maxFractionDigits = 2): string {
  const cleaned = value.replace(/,/g, '').replace(/[^\d.]/g, '');
  const dotIdx = cleaned.indexOf('.');
  if (dotIdx === -1) return cleaned;
  return `${cleaned.slice(0, dotIdx + 1)}${cleaned
    .slice(dotIdx + 1)
    .replace(/\./g, '')
    .slice(0, maxFractionDigits)}`;
}

/** ERX spot / rate display — 6 decimal places max. */
export function formatErxPrice(
  value: number | string,
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number },
): string {
  return formatFinancialNumber(value, {
    minimumFractionDigits: options?.minimumFractionDigits ?? 2,
    maximumFractionDigits: options?.maximumFractionDigits ?? 6,
  });
}

/** Display typed amount with en-US grouping (e.g. 1053.93 → 1,053.93). */
export function formatFinancialInputDisplay(raw: string, maxFractionDigits = 2): string {
  if (!raw) return '';
  const sanitized = sanitizeFinancialAmountInput(raw, maxFractionDigits);
  const trailingDot = sanitized.endsWith('.');
  const dotIdx = sanitized.indexOf('.');

  if (dotIdx === -1) {
    if (!sanitized) return '';
    return BigInt(sanitized).toLocaleString('en-US');
  }

  const intPart = sanitized.slice(0, dotIdx) || '0';
  const decPart = sanitized.slice(dotIdx + 1);
  const intFormatted = BigInt(intPart).toLocaleString('en-US');

  if (trailingDot && !decPart) return `${intFormatted}.`;
  if (decPart) return `${intFormatted}.${decPart}`;
  return intFormatted;
}
