import { CURRENT_NETWORK_INFO } from '../../config/networks';
import { formatAddressForDisplay } from '../../utils/addressValidation';
import { resolveTransactionReportVisual } from '../../utils/transactionReportVisual';
import '../../styles/edex-swap-review.css';
import '../../styles/transaction-report-page.css';

export interface ActivateTxStatusStageProps {
  status: 'success' | 'failed';
  sectionLabel: string;
  actionLabel: string;
  txHash?: `0x${string}`;
  kind: 'activate-approve' | 'activate-package';
  primaryLabel?: string;
  onPrimary?: () => void;
  onRetry?: () => void;
  onClose: () => void;
  isBusy?: boolean;
}

export function ActivateTxStatusStage({
  status,
  sectionLabel,
  actionLabel,
  txHash,
  kind,
  primaryLabel,
  onPrimary,
  onRetry,
  onClose,
  isBusy = false,
}: ActivateTxStatusStageProps) {
  const visual = resolveTransactionReportVisual(kind, status, 'activate');
  const explorerTxUrl = txHash ? `${CURRENT_NETWORK_INFO.explorer}/tx/${txHash}` : null;
  const statusLabel = status === 'success' ? 'Success' : 'Failed';
  const statusClass =
    status === 'success' ? 'edex-review-row-value--success' : 'edex-review-row-value--danger';

  return (
    <div className="activate-exec-stage">
      <div className="edex-approve-card activate-exec-success-card">
        <div className="activate-exec-status-icon" aria-hidden="true">
          <div className={`iconbox ${visual.iconboxClass}`}>{visual.renderIcon()}</div>
        </div>
        <ul className="edex-review-rows">
          <li>
            <span className="edex-review-row-label">Status</span>
            <span className={`edex-review-row-value ${statusClass}`}>{statusLabel}</span>
          </li>
          <li>
            <span className="edex-review-row-label">Section</span>
            <span className="edex-review-row-value">{sectionLabel}</span>
          </li>
          <li>
            <span className="edex-review-row-label">Action</span>
            <span className="edex-review-row-value">{actionLabel}</span>
          </li>
          {txHash && explorerTxUrl ? (
            <li>
              <span className="edex-review-row-label">Transaction Hash</span>
              <span className="edex-review-row-value">
                <a
                  className="edex-review-tx-link fw-medium"
                  href={explorerTxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {formatAddressForDisplay(txHash, 10, 8)}
                </a>
              </span>
            </li>
          ) : null}
        </ul>
        <div className="activate-exec-actions activate-exec-actions--in-card">
          {onRetry ? (
            <button
              type="button"
              className="btn btn-primary btn-lg activate-exec-primary fw-medium"
              disabled={isBusy}
              onClick={onRetry}
            >
              {isBusy ? 'Waiting for wallet…' : 'Try activation again'}
            </button>
          ) : null}
          {onPrimary && primaryLabel ? (
            <button
              type="button"
              className="btn btn-primary btn-lg activate-exec-primary fw-medium"
              onClick={onPrimary}
            >
              {primaryLabel}
            </button>
          ) : null}
          <button
            type="button"
            className="btn btn-text-secondary activate-exec-cancel fw-medium"
            onClick={onClose}
            disabled={isBusy}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
