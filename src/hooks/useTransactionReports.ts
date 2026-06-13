import { useMemo } from 'react';
import { loadTransactionReports } from '../utils/transactionReportStore';
import type { TransactionReportRecord } from '../types/transactionReport';

/** Loads all saved on-device reports for the connected wallet. Pass refreshKey to reload. */
export function useTransactionReports(
  walletAddress?: string | null,
  refreshKey = 0,
): TransactionReportRecord[] {
  return useMemo(() => {
    void refreshKey;
    if (!walletAddress) return [];
    return loadTransactionReports(walletAddress);
  }, [walletAddress, refreshKey]);
}
