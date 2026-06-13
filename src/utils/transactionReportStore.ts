import type { TransactionReportRecord, TransactionReportSource } from '../types/transactionReport';
import { edexRecordToReport, normalizeReportFields } from './buildTransactionReportRecord';

const STORAGE_PREFIX = 'titan-tx-reports';
const LEGACY_EDEX_PREFIX = 'titan-edex-tx-history';

/** Keep reports for ~6 months; older entries are removed on save/load. */
export const TRANSACTION_REPORT_RETENTION_MS = 180 * 24 * 60 * 60 * 1000;

const MAX_RECORDS_PER_WALLET = 400;

function storageKey(wallet: string) {
  return `${STORAGE_PREFIX}:${wallet.toLowerCase()}`;
}

function normalizeStoredRecord(record: TransactionReportRecord): TransactionReportRecord {
  const { fields, section, action } = normalizeReportFields(record.fields ?? [], record);
  const resolvedSection = record.section ?? section;
  const resolvedAction = record.action ?? action;
  return {
    ...record,
    section: resolvedSection,
    action: resolvedAction,
    category: record.category ?? `${resolvedSection} — ${resolvedAction}`,
    fields,
  };
}

function pruneByRetention(records: TransactionReportRecord[]): TransactionReportRecord[] {
  const cutoff = Date.now() - TRANSACTION_REPORT_RETENTION_MS;
  return records
    .filter((r) => {
      const ts = new Date(r.createdAt).getTime();
      return Number.isFinite(ts) && ts >= cutoff;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, MAX_RECORDS_PER_WALLET)
    .map(normalizeStoredRecord);
}

function migrateLegacyEdex(wallet: string): TransactionReportRecord[] {
  if (typeof localStorage === 'undefined' || !wallet) return [];
  const legacyKey = `${LEGACY_EDEX_PREFIX}:${wallet.toLowerCase()}`;
  const raw = localStorage.getItem(legacyKey);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as Array<Record<string, unknown>>;
    if (!Array.isArray(parsed)) return [];

    const migrated = parsed.map((item) =>
      edexRecordToReport({
        hash: String(item.hash ?? ''),
        kind: item.kind as 'edex-approve' | 'edex-swap' | 'edex-sell',
        status: (item.status as TransactionReportRecord['status']) ?? 'success',
        walletAddress: String(item.walletAddress ?? wallet),
        payTokenSymbol: String(item.payTokenSymbol ?? '—'),
        payTokenAmount: String(item.payTokenAmount ?? '—'),
        receiveTokenSymbol: String(item.receiveTokenSymbol ?? '—'),
        receiveTokenAmount: String(item.receiveTokenAmount ?? '—'),
        feeAmount: item.feeAmount != null ? String(item.feeAmount) : undefined,
        feeTokenSymbol: item.feeTokenSymbol != null ? String(item.feeTokenSymbol) : undefined,
        gasPaidPol: item.gasPaidPol != null ? String(item.gasPaidPol) : undefined,
        blockNumber: typeof item.blockNumber === 'number' ? item.blockNumber : undefined,
        createdAt: String(item.createdAt ?? new Date().toISOString()),
      }),
    );

    localStorage.removeItem(legacyKey);
    return migrated;
  } catch {
    return [];
  }
}

export function loadTransactionReports(
  wallet: string,
  options?: { sources?: TransactionReportSource[] },
): TransactionReportRecord[] {
  if (!wallet || typeof localStorage === 'undefined') return [];

  let list: TransactionReportRecord[] = [];
  try {
    const raw = localStorage.getItem(storageKey(wallet));
    if (raw) {
      const parsed = JSON.parse(raw) as TransactionReportRecord[];
      list = Array.isArray(parsed) ? parsed : [];
    }
  } catch {
    list = [];
  }

  const legacy = migrateLegacyEdex(wallet);
  if (legacy.length > 0) {
    const merged = [...list];
    for (const item of legacy) {
      if (!merged.some((r) => r.hash === item.hash)) merged.push(item);
    }
    list = pruneByRetention(merged);
    localStorage.setItem(storageKey(wallet), JSON.stringify(list));
  } else {
    const pruned = pruneByRetention(list);
    if (pruned.length !== list.length) {
      localStorage.setItem(storageKey(wallet), JSON.stringify(pruned));
    }
    list = pruned;
  }

  if (options?.sources?.length) {
    return list.filter((r) => options.sources!.includes(r.source));
  }
  return list;
}

export function saveTransactionReport(record: TransactionReportRecord): void {
  if (!record.walletAddress || typeof localStorage === 'undefined') return;
  const existing = loadTransactionReports(record.walletAddress);
  const next = pruneByRetention([
    record,
    ...existing.filter((t) => t.hash !== record.hash),
  ]);
  localStorage.setItem(storageKey(record.walletAddress), JSON.stringify(next));
}

export function updateTransactionReport(
  wallet: string,
  hash: string,
  status: TransactionReportRecord['status'],
  patch?: Partial<TransactionReportRecord>,
): void {
  const list = loadTransactionReports(wallet);
  const idx = list.findIndex((t) => t.hash === hash);
  if (idx === -1) return;
  list[idx] = {
    ...list[idx],
    status,
    ...patch,
    fields: patch?.fields ?? list[idx].fields,
  };
  localStorage.setItem(storageKey(wallet), JSON.stringify(pruneByRetention(list)));
}

export function getTransactionReport(
  wallet: string,
  hash: string,
): TransactionReportRecord | undefined {
  return loadTransactionReports(wallet).find((t) => t.hash === hash);
}

export function findTransactionReportByHash(hash: string): TransactionReportRecord | undefined {
  if (!hash || typeof localStorage === 'undefined') return undefined;

  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key?.startsWith(`${STORAGE_PREFIX}:`)) continue;
      const wallet = key.slice(STORAGE_PREFIX.length + 1);
      const hit = getTransactionReport(wallet, hash);
      if (hit) return hit;
    }
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key?.startsWith(`${LEGACY_EDEX_PREFIX}:`)) continue;
      const wallet = key.slice(LEGACY_EDEX_PREFIX.length + 1);
      migrateLegacyEdex(wallet);
      const hit = getTransactionReport(wallet, hash);
      if (hit) return hit;
    }
  } catch {
    return undefined;
  }
  return undefined;
}
