import type { TransactionReportStatus } from '../types/transactionReport';

const NON_NUMERIC = /^(unlimited|max|max allowance|—|n\/a)$/i;

export function formatReportDecimal(raw: string | number | undefined | null): string {
  if (raw == null || raw === '') return '—';
  const text = String(raw).trim();
  if (NON_NUMERIC.test(text)) return text;
  if (text.includes('%')) return text;

  const normalized = text.replace(/,/g, '');
  const n = typeof raw === 'number' ? raw : parseFloat(normalized);
  if (Number.isFinite(n)) return n.toFixed(2);
  return text;
}

export function formatReportTokenAmount(amount: string | number | undefined, symbol?: string): string {
  const formatted = formatReportDecimal(amount);
  if (formatted === '—' || !symbol) return formatted;
  return `${formatted} ${symbol}`.trim();
}

export function splitReportDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return { date: '—', time: '—' };
  }
  return {
    date: d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    time: d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  };
}

export function statusLabel(status: TransactionReportStatus): string {
  if (status === 'success') return 'Success';
  if (status === 'failed') return 'Failed';
  return 'Pending';
}
