import type { ReactNode } from 'react';
import SwapIcon from '@iconify-react/tdesign/swap';
import WorkspacePremiumRoundedIcon from '@iconify-react/material-symbols-light/workspace-premium-rounded';
import OutlinePendingActionsIcon from '@iconify-react/ic/outline-pending-actions';
import { AppIcon } from '../components/icons/AppIcon';
import type { TransactionReportSource, TransactionReportStatus } from '../types/transactionReport';

export interface TransactionReportVisual {
  iconboxClass: string;
  renderIcon: () => ReactNode;
}

export function resolveTransactionReportVisual(
  kind: string,
  status: TransactionReportStatus,
  source?: TransactionReportSource,
): TransactionReportVisual {
  const failed = status === 'failed';
  const pending = status === 'pending';

  if (kind === 'edex-approve' || kind === 'activate-approve') {
    return {
      iconboxClass: failed
        ? 'transaction-report-iconbox--failed'
        : pending
          ? 'transaction-report-iconbox--approve-pending'
          : 'transaction-report-iconbox--approve',
      renderIcon: () => (
        <OutlinePendingActionsIcon height="1.75rem" width="1.75rem" aria-hidden />
      ),
    };
  }

  if (kind === 'activate-package' || source === 'activate') {
    return {
      iconboxClass: failed
        ? 'transaction-report-iconbox--activate-failed'
        : pending
          ? 'transaction-report-iconbox--activate-pending'
          : 'transaction-report-iconbox--activate-success',
      renderIcon: () => (
        <WorkspacePremiumRoundedIcon height="1.75rem" width="1.75rem" aria-hidden />
      ),
    };
  }

  if (kind === 'credit-card-buy') {
    return {
      iconboxClass: failed ? 'transaction-report-iconbox--failed' : 'transaction-report-iconbox--card-success',
      renderIcon: () => <AppIcon icon="lucide:credit-card" width={28} height={28} />,
    };
  }

  if (kind === 'pending-stars-claim' || source === 'pending-stars') {
    return {
      iconboxClass: failed
        ? 'transaction-report-iconbox--failed'
        : pending
          ? 'transaction-report-iconbox--activate-pending'
          : 'transaction-report-iconbox--activate-success',
      renderIcon: () => <AppIcon icon="lucide:star" width={28} height={28} />,
    };
  }

  if (kind === 'send' || source === 'send-money') {
    return {
      iconboxClass: failed ? 'transaction-report-iconbox--failed' : 'transaction-report-iconbox--send-success',
      renderIcon: () => <AppIcon icon="lucide:send" width={28} height={28} />,
    };
  }

  if (kind.startsWith('edex') || source === 'edex') {
    return {
      iconboxClass: failed
        ? 'transaction-report-iconbox--failed'
        : pending
          ? 'transaction-report-iconbox--swap-pending'
          : 'transaction-report-iconbox--swap-success',
      renderIcon: () => <SwapIcon height="1.75rem" width="1.75rem" aria-hidden />,
    };
  }

  return {
    iconboxClass: failed ? 'transaction-report-iconbox--failed' : 'transaction-report-iconbox--default',
    renderIcon: () => <AppIcon icon="lucide:arrow-right" width={28} height={28} />,
  };
}
