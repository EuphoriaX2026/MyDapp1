import { CURRENT_NETWORK_INFO } from '../config/networks';
import { BUSINESS_STARS_PATH } from '../config/businessHubRoutes';
import type {
  EdexTxKind,
  TransactionReportField,
  TransactionReportRecord,
  TransactionReportStatus,
} from '../types/transactionReport';
import {
  formatReportDecimal,
  formatReportTokenAmount,
  splitReportDateTime,
  statusLabel,
} from './formatTransactionReport';

function baseFields(input: {
  status: TransactionReportStatus;
  section: string;
  action: string;
  createdAt: string;
  blockNumber?: number;
  extra?: TransactionReportField[];
}): TransactionReportField[] {
  const { date, time } = splitReportDateTime(input.createdAt);
  const rows: TransactionReportField[] = [
    {
      id: 'status',
      label: 'Status',
      value: statusLabel(input.status),
      tone:
        input.status === 'success'
          ? 'success'
          : input.status === 'failed'
            ? 'danger'
            : 'warning',
    },
    { id: 'section', label: 'Section', value: input.section },
    { id: 'action', label: 'Action', value: input.action },
    { id: 'date', label: 'Date', value: date },
    { id: 'time', label: 'Time', value: time },
  ];
  if (input.blockNumber != null) {
    rows.push({ id: 'block', label: 'Block', value: String(input.blockNumber) });
  }
  if (input.extra?.length) rows.push(...input.extra);
  return rows;
}

export function buildEdexTransactionReport(input: {
  hash: string;
  kind: EdexTxKind;
  status: TransactionReportStatus;
  walletAddress: string;
  payTokenSymbol: string;
  payTokenAmount: string;
  receiveTokenSymbol: string;
  receiveTokenAmount: string;
  feeAmount?: string;
  feeTokenSymbol?: string;
  gasPaidPol?: string;
  blockNumber?: number;
  createdAt?: string;
  returnTo?: string;
}): TransactionReportRecord {
  const createdAt = input.createdAt ?? new Date().toISOString();
  const section = 'EDex';
  const action = input.kind === 'edex-approve' ? 'Token approval' : 'Swap';
  const category = `${section} — ${action}`;

  const extra: TransactionReportField[] = [
    {
      id: 'paid',
      label: 'You paid',
      value:
        input.kind === 'edex-approve'
          ? `Unlimited ${input.payTokenSymbol}`
          : formatReportTokenAmount(input.payTokenAmount, input.payTokenSymbol),
    },
    {
      id: 'received',
      label: 'You received',
      value:
        input.kind === 'edex-approve'
          ? 'Max allowance'
          : formatReportTokenAmount(input.receiveTokenAmount, input.receiveTokenSymbol),
      tone: input.kind === 'edex-approve' ? undefined : 'success',
    },
  ];

  if (input.feeAmount && input.kind !== 'edex-approve') {
    extra.push({
      id: 'protocol-fee',
      label: 'Protocol fee',
      value: input.feeAmount.includes('%')
        ? input.feeAmount
        : formatReportTokenAmount(input.feeAmount, input.feeTokenSymbol),
    });
  }

  if (input.gasPaidPol) {
    extra.push({
      id: 'network-fee',
      label: 'Network fee',
      value: `${formatReportDecimal(input.gasPaidPol)} ${CURRENT_NETWORK_INFO.symbol}`,
    });
  }

  return {
    id: input.hash,
    hash: input.hash,
    source: 'edex',
    kind: input.kind,
    section,
    action,
    category,
    status: input.status,
    walletAddress: input.walletAddress,
    createdAt,
    blockNumber: input.blockNumber,
    fields: baseFields({
      status: input.status,
      section,
      action,
      createdAt,
      blockNumber: input.blockNumber,
      extra,
    }),
    returnTo: input.returnTo,
  };
}

/** @deprecated alias */
export function edexRecordToReport(
  input: Parameters<typeof buildEdexTransactionReport>[0],
): TransactionReportRecord {
  return buildEdexTransactionReport(input);
}

export function buildCreditCardTransactionReport(input: {
  hash: string;
  status: TransactionReportStatus;
  walletAddress: string;
  cardLabel: string;
  payErxAmount: string;
  receiveE1Amount: string;
  gasPaidPol?: string;
  blockNumber?: number;
  createdAt?: string;
  returnTo?: string;
}): TransactionReportRecord {
  const createdAt = input.createdAt ?? new Date().toISOString();
  const section = 'Credit Card';
  const action = 'Card purchase';
  const category = `${section} — ${action}`;

  const extra: TransactionReportField[] = [
    { id: 'card', label: 'Card', value: input.cardLabel },
    {
      id: 'paid',
      label: 'You paid',
      value: formatReportTokenAmount(input.payErxAmount, 'ERX'),
    },
    {
      id: 'received',
      label: 'You received',
      value: formatReportTokenAmount(input.receiveE1Amount, 'E1'),
      tone: 'success',
    },
  ];

  if (input.gasPaidPol) {
    extra.push({
      id: 'network-fee',
      label: 'Network fee',
      value: `${formatReportDecimal(input.gasPaidPol)} ${CURRENT_NETWORK_INFO.symbol}`,
    });
  }

  return {
    id: input.hash,
    hash: input.hash,
    source: 'edex',
    kind: 'credit-card-buy',
    section,
    action,
    category,
    status: input.status,
    walletAddress: input.walletAddress,
    createdAt,
    blockNumber: input.blockNumber,
    fields: baseFields({
      status: input.status,
      section,
      action,
      createdAt,
      blockNumber: input.blockNumber,
      extra,
    }),
    returnTo: input.returnTo ?? '/edex',
  };
}

export function buildSendMoneyTransactionReport(input: {
  hash: string;
  status: TransactionReportStatus;
  walletAddress: string;
  toLabel: string;
  amount: string;
  tokenSymbol: string;
  fiatLabel?: string;
  gasPaidPol?: string;
  blockNumber?: number;
  createdAt?: string;
  returnTo?: string;
}): TransactionReportRecord {
  const createdAt = input.createdAt ?? new Date().toISOString();
  const section = 'Send Money';
  const action = 'Transfer';
  const category = `${section} — ${action}`;
  const amountValue = formatReportTokenAmount(input.amount, input.tokenSymbol);

  const extra: TransactionReportField[] = [
    { id: 'to', label: 'To', value: input.toLabel },
    {
      id: 'amount',
      label: 'Amount',
      value: input.fiatLabel ? `${amountValue} (${input.fiatLabel})` : amountValue,
    },
  ];

  if (input.gasPaidPol) {
    extra.push({
      id: 'network-fee',
      label: 'Network fee',
      value: `${formatReportDecimal(input.gasPaidPol)} ${CURRENT_NETWORK_INFO.symbol}`,
    });
  }

  return {
    id: input.hash,
    hash: input.hash,
    source: 'send-money',
    kind: 'send',
    section,
    action,
    category,
    status: input.status,
    walletAddress: input.walletAddress,
    createdAt,
    blockNumber: input.blockNumber,
    fields: baseFields({
      status: input.status,
      section,
      action,
      createdAt,
      blockNumber: input.blockNumber,
      extra,
    }),
    returnTo: input.returnTo ?? '/send-money',
  };
}

export function patchReportFromReceipt(
  base: TransactionReportRecord,
  status: TransactionReportStatus,
  options?: { blockNumber?: number; gasPaidPol?: string; createdAt?: string },
): TransactionReportRecord {
  const createdAt = options?.createdAt ?? base.createdAt;
  const { date, time } = splitReportDateTime(createdAt);

  let fields = base.fields.map((field) => {
    if (field.id === 'status') {
      return {
        ...field,
        value: statusLabel(status),
        tone:
          status === 'success' ? ('success' as const) : status === 'failed' ? ('danger' as const) : ('warning' as const),
      };
    }
    if (field.id === 'date') return { ...field, value: date };
    if (field.id === 'time') return { ...field, value: time };
    if (field.id === 'block' && options?.blockNumber != null) {
      return { ...field, value: String(options.blockNumber) };
    }
    if (field.id === 'network-fee' && options?.gasPaidPol) {
      return {
        ...field,
        value: `${formatReportDecimal(options.gasPaidPol)} ${CURRENT_NETWORK_INFO.symbol}`,
      };
    }
    return field;
  });

  if (options?.blockNumber != null && !fields.some((f) => f.id === 'block')) {
    const timeIdx = fields.findIndex((f) => f.id === 'time');
    const blockField: TransactionReportField = {
      id: 'block',
      label: 'Block',
      value: String(options.blockNumber),
    };
    fields =
      timeIdx >= 0
        ? [...fields.slice(0, timeIdx + 1), blockField, ...fields.slice(timeIdx + 1)]
        : [...fields, blockField];
  }

  if (options?.gasPaidPol && !fields.some((f) => f.id === 'network-fee')) {
    fields.push({
      id: 'network-fee',
      label: 'Network fee',
      value: `${formatReportDecimal(options.gasPaidPol)} ${CURRENT_NETWORK_INFO.symbol}`,
    });
  }

  return {
    ...base,
    status,
    createdAt,
    blockNumber: options?.blockNumber ?? base.blockNumber,
    fields,
  };
}

export function legacyEdexToReport(
  partial: Partial<TransactionReportRecord> & {
    payTokenSymbol?: string;
    payTokenAmount?: string;
    receiveTokenSymbol?: string;
    receiveTokenAmount?: string;
    feeAmount?: string;
    feeTokenSymbol?: string;
    gasPaidPol?: string;
  },
  hash: string,
  wallet: string,
): TransactionReportRecord | null {
  if (partial.fields?.length) {
    const normalized = normalizeReportFields(partial.fields, partial);
    const section = partial.section ?? normalized.section;
    const action = partial.action ?? normalized.action;
    return {
      id: partial.id ?? hash,
      hash,
      source: partial.source ?? 'edex',
      kind: partial.kind ?? 'transfer',
      section,
      action,
      category: partial.category ?? `${section} — ${action}`,
      status: partial.status ?? 'pending',
      walletAddress: partial.walletAddress ?? wallet,
      createdAt: partial.createdAt ?? new Date().toISOString(),
      blockNumber: partial.blockNumber,
      fields: normalized.fields,
      returnTo: partial.returnTo,
    };
  }

  if (!partial.payTokenSymbol && !partial.kind) return null;

  return buildEdexTransactionReport({
    hash,
    kind: (partial.kind ?? 'edex-swap') as EdexTxKind,
    status: partial.status ?? 'pending',
    walletAddress: partial.walletAddress ?? wallet,
    payTokenSymbol: partial.payTokenSymbol ?? '—',
    payTokenAmount: partial.payTokenAmount ?? '—',
    receiveTokenSymbol: partial.receiveTokenSymbol ?? '—',
    receiveTokenAmount: partial.receiveTokenAmount ?? '—',
    feeAmount: partial.feeAmount,
    feeTokenSymbol: partial.feeTokenSymbol,
    gasPaidPol: partial.gasPaidPol,
    blockNumber: partial.blockNumber,
    createdAt: partial.createdAt,
    returnTo: partial.returnTo,
  });
}

export function inferSectionAction(
  source?: string,
  kind?: string,
  legacyCategory?: string,
): { section: string; action: string } {
  if (legacyCategory?.includes(' — ')) {
    const [section, action] = legacyCategory.split(' — ');
    return { section: section.trim(), action: action.trim() };
  }

  switch (source) {
    case 'edex':
      return {
        section: 'EDex',
        action:
          kind === 'edex-approve'
            ? 'Token approval'
            : kind === 'credit-card-buy'
              ? 'Card purchase'
              : 'Swap',
      };
    case 'send-money':
      return { section: 'Send Money', action: 'Transfer' };
    case 'activate':
      return { section: 'Activate', action: kind ?? 'Activation' };
    case 'store':
      return { section: 'Store', action: kind ?? 'Checkout' };
    case 'withdraw-e1':
      return { section: 'Withdraw E1', action: kind ?? 'Withdraw' };
    default:
      return { section: legacyCategory ?? 'Transaction', action: kind ?? '—' };
  }
}

export function normalizeReportFields(
  fields: TransactionReportField[],
  meta?: Partial<TransactionReportRecord>,
): { fields: TransactionReportField[]; section: string; action: string } {
  const hasSection = fields.some((f) => f.id === 'section');
  if (hasSection) {
    const section = fields.find((f) => f.id === 'section')?.value ?? meta?.section ?? '—';
    const action = fields.find((f) => f.id === 'action')?.value ?? meta?.action ?? '—';
    return { fields, section, action };
  }

  const categoryField = fields.find((f) => f.id === 'category');
  const { section, action } = inferSectionAction(
    meta?.source,
    meta?.kind,
    categoryField?.value ?? meta?.category,
  );

  const withoutCategory = fields.filter((f) => f.id !== 'category');
  const statusIdx = withoutCategory.findIndex((f) => f.id === 'status');
  const insertAt = statusIdx >= 0 ? statusIdx + 1 : 0;
  const sectionAction: TransactionReportField[] = [
    { id: 'section', label: 'Section', value: section },
    { id: 'action', label: 'Action', value: action },
  ];

  return {
    section,
    action,
    fields: [
      ...withoutCategory.slice(0, insertAt),
      ...sectionAction,
      ...withoutCategory.slice(insertAt),
    ],
  };
}

export function buildActivateTransactionReport(input: {
  hash: string;
  kind: 'activate-approve' | 'activate-package';
  status: TransactionReportStatus;
  walletAddress: string;
  packageName: string;
  e1Amount?: string;
  activationType?: string;
  gasPaidPol?: string;
  blockNumber?: number;
  createdAt?: string;
  returnTo?: string;
}): TransactionReportRecord {
  const createdAt = input.createdAt ?? new Date().toISOString();
  const section = 'Activate';
  const action =
    input.kind === 'activate-approve' ? 'Token approval' : input.packageName;
  const category = `${section} — ${action}`;

  const extra: TransactionReportField[] = [];

  if (input.kind === 'activate-approve') {
    extra.push(
      {
        id: 'paid',
        label: 'You paid',
        value: 'Unlimited E1',
      },
      {
        id: 'received',
        label: 'You received',
        value: 'Max allowance',
      },
    );
  } else {
    extra.push(
      { id: 'package', label: 'Package', value: input.packageName },
      ...(input.activationType
        ? [{ id: 'activation-type', label: 'Activation Type', value: input.activationType }]
        : []),
      ...(input.e1Amount
        ? [
            {
              id: 'paid',
              label: 'You paid',
              value: formatReportTokenAmount(input.e1Amount, 'E1'),
            },
          ]
        : []),
    );
  }

  if (input.gasPaidPol) {
    extra.push({
      id: 'network-fee',
      label: 'Network fee',
      value: `${formatReportDecimal(input.gasPaidPol)} ${CURRENT_NETWORK_INFO.symbol}`,
    });
  }

  return {
    id: input.hash,
    hash: input.hash,
    source: 'activate',
    kind: input.kind,
    section,
    action,
    category,
    status: input.status,
    walletAddress: input.walletAddress,
    createdAt,
    blockNumber: input.blockNumber,
    fields: baseFields({
      status: input.status,
      section,
      action,
      createdAt,
      blockNumber: input.blockNumber,
      extra,
    }),
    returnTo: input.returnTo ?? '/Activate',
  };
}

export function buildPendingStarsClaimReport(input: {
  hash: string;
  status: TransactionReportStatus;
  walletAddress: string;
  totalRftShares: bigint;
  totalPoints?: bigint;
  blockNumber?: number;
  gasPaidPol?: string;
  createdAt?: string;
  returnTo?: string;
}): TransactionReportRecord {
  const createdAt = input.createdAt ?? new Date().toISOString();
  const section = 'Pending Stars';
  const action = 'Claim RFT Shares';
  const category = `${section} — ${action}`;

  const extra: TransactionReportField[] = [
    {
      id: 'received',
      label: 'You received',
      value: `${formatReportDecimal(input.totalRftShares.toString())} RFT`,
    },
  ];

  if (input.totalPoints != null && input.totalPoints > 0n) {
    extra.unshift({
      id: 'points',
      label: 'Total points',
      value: input.totalPoints.toString(),
    });
  }

  if (input.gasPaidPol) {
    extra.push({
      id: 'network-fee',
      label: 'Network fee',
      value: `${formatReportDecimal(input.gasPaidPol)} ${CURRENT_NETWORK_INFO.symbol}`,
    });
  }

  return {
    id: input.hash,
    hash: input.hash,
    source: 'pending-stars',
    kind: 'pending-stars-claim',
    section,
    action,
    category,
    status: input.status,
    walletAddress: input.walletAddress,
    createdAt,
    blockNumber: input.blockNumber,
    fields: baseFields({
      status: input.status,
      section,
      action,
      createdAt,
      blockNumber: input.blockNumber,
      extra,
    }),
    returnTo: input.returnTo ?? BUSINESS_STARS_PATH,
  };
}

export function reportTitle(status: TransactionReportStatus, kind: string): string {
  if (status === 'pending') return 'Processing transaction…';
  if (status === 'failed') return 'Transaction failed';
  if (kind === 'pending-stars-claim') {
    return status === 'success' ? 'RFT shares received' : 'Claim failed';
  }
  if (kind === 'edex-approve' || kind === 'activate-approve') {
    return status === 'success' ? 'Approval successful' : 'Approval failed';
  }
  if (kind === 'activate-package') {
    return status === 'success' ? 'Activation successful' : 'Activation failed';
  }
  if (kind === 'credit-card-buy') return 'Purchase successful';
  if (kind.startsWith('edex')) return 'Swap successful';
  if (kind === 'send') return status === 'success' ? 'Payment sent' : 'Payment failed';
  return status === 'success' ? 'Transaction successful' : 'Transaction failed';
}
