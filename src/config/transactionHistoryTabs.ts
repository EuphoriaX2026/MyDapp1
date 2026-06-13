import type { TransactionReportRecord } from '../types/transactionReport';

export type TransactionHistoryTabId = 'all' | 'edex' | 'card' | 'send' | 'activate' | 'stars';

export interface TransactionHistoryTab {
  id: TransactionHistoryTabId;
  label: string;
  emptyTitle: string;
  emptyHint: string;
}

export const TRANSACTION_HISTORY_TABS: TransactionHistoryTab[] = [
  {
    id: 'all',
    label: 'All',
    emptyTitle: 'No activity yet',
    emptyHint: 'Your on-device transaction reports will appear here after you swap, send, activate, or claim.',
  },
  {
    id: 'edex',
    label: 'EDex',
    emptyTitle: 'No EDex activity',
    emptyHint: 'Swaps and token approvals from EDex will show up here.',
  },
  {
    id: 'card',
    label: 'Card',
    emptyTitle: 'No card purchases',
    emptyHint: 'Credit card purchases through EDex will appear in this tab.',
  },
  {
    id: 'send',
    label: 'Send',
    emptyTitle: 'No send transactions',
    emptyHint: 'Outgoing transfers from Send Money will be listed here.',
  },
  {
    id: 'activate',
    label: 'Activations',
    emptyTitle: 'No activations',
    emptyHint: 'Package activations and approvals will show up here.',
  },
  {
    id: 'stars',
    label: 'Stars',
    emptyTitle: 'No stars claims',
    emptyHint: 'Pending Stars claim transactions will appear here.',
  },
];

const TAB_IDS = new Set<string>(TRANSACTION_HISTORY_TABS.map((t) => t.id));

export function isTransactionHistoryTabId(value: string | null): value is TransactionHistoryTabId {
  return value != null && TAB_IDS.has(value);
}

export function parseTransactionHistoryTab(search: string): TransactionHistoryTabId {
  const tab = new URLSearchParams(search).get('tab');
  return isTransactionHistoryTabId(tab) ? tab : 'all';
}

export function getTransactionHistoryPath(tab: TransactionHistoryTabId = 'all'): string {
  if (tab === 'all') return '/transactions';
  return `/transactions?tab=${tab}`;
}

export function filterReportsByTab(
  reports: TransactionReportRecord[],
  tab: TransactionHistoryTabId,
): TransactionReportRecord[] {
  switch (tab) {
    case 'all':
      return reports;
    case 'edex':
      return reports.filter((r) => r.source === 'edex' && r.kind !== 'credit-card-buy');
    case 'card':
      return reports.filter((r) => r.kind === 'credit-card-buy');
    case 'send':
      return reports.filter((r) => r.source === 'send-money');
    case 'activate':
      return reports.filter((r) => r.source === 'activate');
    case 'stars':
      return reports.filter((r) => r.source === 'pending-stars');
    default:
      return reports;
  }
}

export function getHistoryTabForRecord(record: TransactionReportRecord): TransactionHistoryTabId {
  if (record.kind === 'credit-card-buy') return 'card';
  if (record.source === 'send-money') return 'send';
  if (record.source === 'activate') return 'activate';
  if (record.source === 'pending-stars') return 'stars';
  if (record.source === 'edex') return 'edex';
  return 'all';
}

export function getTransactionHistoryTabMeta(tab: TransactionHistoryTabId): TransactionHistoryTab {
  return TRANSACTION_HISTORY_TABS.find((t) => t.id === tab) ?? TRANSACTION_HISTORY_TABS[0];
}
