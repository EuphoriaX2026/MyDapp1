import type { EdexTransactionRecord, EdexTxKind } from '../types/transactionReport';
import { CURRENT_NETWORK_INFO } from '../config/networks';
import { buildEdexTransactionReport } from './buildTransactionReportRecord';

/** Returns legacy EDex record shape for router state compatibility. */
export function buildEdexTxRecord(input: {
  hash: string;
  kind: EdexTxKind;
  status: EdexTransactionRecord['status'];
  walletAddress: string;
  payTokenSymbol: string;
  payTokenAmount: string;
  receiveTokenSymbol: string;
  receiveTokenAmount: string;
  feeAmount?: string;
  feeTokenSymbol?: string;
  gasPaidPol?: string;
  spender?: string;
  mode?: 'BUY' | 'SELL';
  stableSymbol?: string;
  blockNumber?: number;
  createdAt?: string;
  returnTo?: string;
}): EdexTransactionRecord {
  const report = buildEdexTransactionReport(input);

  return {
    id: report.id,
    hash: report.hash,
    kind: input.kind,
    status: report.status,
    walletAddress: report.walletAddress,
    createdAt: report.createdAt,
    blockNumber: report.blockNumber,
    payTokenSymbol: input.payTokenSymbol,
    payTokenAmount: input.payTokenAmount,
    receiveTokenSymbol: input.receiveTokenSymbol,
    receiveTokenAmount: input.receiveTokenAmount,
    feeAmount: input.feeAmount,
    feeTokenSymbol: input.feeTokenSymbol,
    gasPaidPol: input.gasPaidPol,
    spender: input.spender,
    mode: input.mode,
    stableSymbol: input.stableSymbol,
    explorerUrl: `${CURRENT_NETWORK_INFO.explorer}/tx/${input.hash}`,
    network: 'polygon-amoy',
  };
}
