import type { TransactionReportRecord } from '../types/transactionReport';

/** Unified one-line summary for history list rows. */
export function buildTransactionSummaryLine(tx: TransactionReportRecord): string {
  const paid = tx.fields.find((f) => f.id === 'paid');
  const received = tx.fields.find((f) => f.id === 'received');
  const amount = tx.fields.find((f) => f.id === 'amount');
  const pkg = tx.fields.find((f) => f.id === 'package');
  const card = tx.fields.find((f) => f.id === 'card');

  if (amount?.value) return amount.value;
  if (card?.value && paid?.value) return `${card.value} · ${paid.value}`;
  if (pkg?.value) return paid?.value ? `${pkg.value} · ${paid.value}` : pkg.value;
  if (paid?.value && received?.value) return `${paid.value} → ${received.value}`;
  if (received?.value) return received.value;
  if (paid?.value) return paid.value;
  return tx.action || tx.section || 'Transaction';
}
