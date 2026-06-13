export type TransactionReportStatus = 'pending' | 'success' | 'failed';

export type TransactionReportSource =
  | 'edex'
  | 'send-money'
  | 'activate'
  | 'store'
  | 'withdraw-e1'
  | 'transfer'
  | 'pending-stars';

export type TransactionReportFieldTone = 'success' | 'danger' | 'warning' | 'muted';

export interface TransactionReportField {
  id: string;
  label: string;
  value: string;
  tone?: TransactionReportFieldTone;
}

export interface TransactionReportRecord {
  id: string;
  hash: string;
  source: TransactionReportSource;
  /** Fine-grained type, e.g. edex-swap, send, store-checkout */
  kind: string;
  /** App area — e.g. EDex, Send Money */
  section: string;
  /** Operation within the section — e.g. Swap, Token approval */
  action: string;
  /** @deprecated Combined label; use section + action */
  category: string;
  status: TransactionReportStatus;
  walletAddress: string;
  createdAt: string;
  blockNumber?: number;
  fields: TransactionReportField[];
  returnTo?: string;
}

export type TransactionReportRouteState = Partial<TransactionReportRecord> & {
  returnTo?: string;
};

/** @deprecated Use TransactionReportRecord — kept for EDex call sites during migration */
export type EdexTxKind = 'edex-approve' | 'edex-swap' | 'edex-sell' | 'transfer';
export type EdexTxStatus = TransactionReportStatus;

export interface EdexTransactionRecord {
  id: string;
  hash: string;
  kind: EdexTxKind;
  status: EdexTxStatus;
  walletAddress: string;
  createdAt: string;
  blockNumber?: number;
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
  explorerUrl: string;
  network: 'polygon-amoy';
}

export type EdexTransactionReportState = Partial<EdexTransactionRecord> & {
  returnTo?: string;
};
