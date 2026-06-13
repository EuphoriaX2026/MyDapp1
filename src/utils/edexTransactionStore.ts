import type { EdexTransactionRecord } from '../types/transactionReport';
import { buildEdexTransactionReport } from './buildTransactionReportRecord';
import {
  findTransactionReportByHash,
  getTransactionReport,
  loadTransactionReports,
  saveTransactionReport,
  updateTransactionReport,
} from './transactionReportStore';
import { CURRENT_NETWORK_INFO } from '../config/networks';

function toLegacy(report: ReturnType<typeof getTransactionReport>): EdexTransactionRecord | undefined {
  if (!report || report.source !== 'edex') return undefined;
  const paid = report.fields.find((f) => f.id === 'paid');
  const received = report.fields.find((f) => f.id === 'received');
  const protocolFee = report.fields.find((f) => f.id === 'protocol-fee');
  const networkFee = report.fields.find((f) => f.id === 'network-fee');

  return {
    id: report.id,
    hash: report.hash,
    kind: report.kind as EdexTransactionRecord['kind'],
    status: report.status,
    walletAddress: report.walletAddress,
    createdAt: report.createdAt,
    blockNumber: report.blockNumber,
    payTokenSymbol: paid?.value ?? '—',
    payTokenAmount: paid?.value ?? '—',
    receiveTokenSymbol: received?.value ?? '—',
    receiveTokenAmount: received?.value ?? '—',
    feeAmount: protocolFee?.value,
    gasPaidPol: networkFee?.value?.split(' ')[0],
    explorerUrl: `${CURRENT_NETWORK_INFO.explorer}/tx/${report.hash}`,
    network: 'polygon-amoy',
  };
}

/** @deprecated Use loadTransactionReports(wallet, { sources: ['edex'] }) */
export function loadEdexTransactions(wallet: string): EdexTransactionRecord[] {
  return loadTransactionReports(wallet, { sources: ['edex'] }).map(
    (r) => toLegacy(r)!,
  );
}

export function saveEdexTransaction(record: EdexTransactionRecord): void {
  saveTransactionReport(
    buildEdexTransactionReport({
      hash: record.hash,
      kind: record.kind,
      status: record.status,
      walletAddress: record.walletAddress,
      payTokenSymbol: record.payTokenSymbol,
      payTokenAmount: record.payTokenAmount,
      receiveTokenSymbol: record.receiveTokenSymbol,
      receiveTokenAmount: record.receiveTokenAmount,
      feeAmount: record.feeAmount,
      feeTokenSymbol: record.feeTokenSymbol,
      gasPaidPol: record.gasPaidPol,
      blockNumber: record.blockNumber,
      createdAt: record.createdAt,
    }),
  );
}

export function updateEdexTransactionStatus(
  wallet: string,
  hash: string,
  status: EdexTransactionRecord['status'],
  patch?: Partial<EdexTransactionRecord>,
): void {
  if (!patch) {
    updateTransactionReport(wallet, hash, status);
    return;
  }
  const rebuilt = buildEdexTransactionReport({
    hash,
    kind: (patch.kind ?? 'edex-swap') as EdexTransactionRecord['kind'],
    status,
    walletAddress: wallet,
    payTokenSymbol: patch.payTokenSymbol ?? '—',
    payTokenAmount: patch.payTokenAmount ?? '—',
    receiveTokenSymbol: patch.receiveTokenSymbol ?? '—',
    receiveTokenAmount: patch.receiveTokenAmount ?? '—',
    feeAmount: patch.feeAmount,
    feeTokenSymbol: patch.feeTokenSymbol,
    gasPaidPol: patch.gasPaidPol,
    blockNumber: patch.blockNumber,
    createdAt: patch.createdAt,
  });
  updateTransactionReport(wallet, hash, status, rebuilt);
}

export function getEdexTransaction(wallet: string, hash: string): EdexTransactionRecord | undefined {
  return toLegacy(getTransactionReport(wallet, hash));
}

export function findEdexTransactionByHash(hash: string): EdexTransactionRecord | undefined {
  return toLegacy(findTransactionReportByHash(hash));
}
