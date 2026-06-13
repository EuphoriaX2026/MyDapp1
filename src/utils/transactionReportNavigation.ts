import type { TransactionReportSource } from '../types/transactionReport';
import {
  BUSINESS_COMMISSIONS_PATH,
  BUSINESS_STARS_PATH,
} from '../config/businessHubRoutes';
import {
  getHistoryTabForRecord,
  getTransactionHistoryPath,
  type TransactionHistoryTabId,
} from '../config/transactionHistoryTabs';

const TAB_BY_SOURCE: Partial<Record<TransactionReportSource, TransactionHistoryTabId>> = {
  activate: 'activate',
  edex: 'edex',
  'send-money': 'send',
  'pending-stars': 'stars',
};

const UNSAFE_RETURN_PATHS = [
  '/activate/execution',
  '/activate/invoice',
  '/activate/checkout',
  '/edex/checking',
];

export function isSafeTransactionReturnPath(path: string): boolean {
  return !UNSAFE_RETURN_PATHS.some((unsafe) => path.includes(unsafe));
}

/** Back from transaction detail → unified activity hub tab for that record. */
export function getTransactionReportHistoryPath(
  source?: TransactionReportSource,
  kind?: string,
): string {
  if (kind === 'credit-card-buy') return getTransactionHistoryPath('card');
  if (source && TAB_BY_SOURCE[source]) return getTransactionHistoryPath(TAB_BY_SOURCE[source]);
  return getTransactionHistoryPath('all');
}

/** Resolve history tab path from a stored report (preferred when record is available). */
export function getTransactionReportHistoryPathFromRecord(record: {
  source: TransactionReportSource;
  kind: string;
}): string {
  return getTransactionHistoryPath(getHistoryTabForRecord(record));
}

/** Close / exit from transaction detail → section home (never execution/checkout). */
export function getTransactionReportSectionHome(
  source?: TransactionReportSource,
  returnTo?: string,
): string {
  if (returnTo && isSafeTransactionReturnPath(returnTo)) return returnTo;
  if (source === 'activate') return '/Activate';
  if (source === 'edex') return '/edex';
  if (source === 'send-money') return '/send-money';
  if (source === 'store') return '/store';
  if (source === 'withdraw-e1') return BUSINESS_COMMISSIONS_PATH;
  if (source === 'transfer') return '/send-money';
  if (source === 'pending-stars') return BUSINESS_STARS_PATH;
  return '/';
}
