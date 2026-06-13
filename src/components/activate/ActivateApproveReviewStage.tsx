import OutlinePendingActionsIcon from '@iconify-react/ic/outline-pending-actions';
import type { ReactNode } from 'react';
import type { EdexTokenMeta } from '../../config/edex-tokens';
import { ActivateE1Logo } from './ActivateE1Logo';
import '../../styles/edex-swap-review.css';

export interface ActivateApproveReviewStageProps {
  payToken: EdexTokenMeta;
  payAmount: string;
  receiveAmount: string;
  activationCostLabel: string;
  isBusy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function E1Amount({ amount }: { amount: string }) {
  return (
    <span className="activate-exec-e1-value">
      {amount}
      <ActivateE1Logo className="activate-invoice-e1-logo h-4 w-auto" />
    </span>
  );
}

function ReviewRow({
  label,
  value,
  success,
  small,
}: {
  label: string;
  value: ReactNode;
  success?: boolean;
  small?: boolean;
}) {
  return (
    <li>
      <span className="edex-review-row-label">{label}</span>
      <span
        className={`edex-review-row-value${success ? ' edex-review-row-value--success' : ''}${
          small ? ' edex-review-row-value--small' : ''
        }`}
      >
        {value}
      </span>
    </li>
  );
}

export function ActivateApproveReviewStage({
  payToken,
  payAmount,
  receiveAmount,
  activationCostLabel,
  isBusy = false,
  onConfirm,
  onCancel,
}: ActivateApproveReviewStageProps) {
  return (
    <div className="activate-exec-stage">
      <div className="edex-review-iconbox edex-review-iconbox--swap edex-review-iconbox--pending" aria-hidden="true">
        <OutlinePendingActionsIcon height="3rem" width="3rem" />
      </div>

      <h2 className="edex-review-title edex-review-title--swap fw-bold">Approve</h2>
      <p className="edex-review-subtitle edex-review-subtitle--swap fw-normal">
        <span className="edex-review-subtitle-line">Check the amounts below, if approved</span>
        <span className="edex-review-subtitle-line">
          click the Confirm button to complete the activation.
        </span>
      </p>

      <div className="edex-review-panel">
        <ul className="edex-review-rows">
          <ReviewRow label="You pay" value={<E1Amount amount={payAmount} />} />
          <ReviewRow label="You receive" value={`${receiveAmount} ${payToken.symbol}`} success />
          <ReviewRow label="Protocol fee" value={<E1Amount amount="0" />} />
          <ReviewRow label="Rate" value="1 E1 ≈ 1 USD" small />
          <ReviewRow label="Activation" value={<E1Amount amount={activationCostLabel} />} />
        </ul>
      </div>

      <p className="edex-review-wallet-hint edex-review-wallet-hint--two-line fw-normal">
        <span className="edex-review-subtitle-line">Your wallet will open only to sign.</span>
        <span className="edex-review-subtitle-line">
          All amounts are shown here in Dapp before you confirm.
        </span>
      </p>

      <div className="activate-exec-actions">
        <button
          type="button"
          className="btn btn-primary btn-lg activate-exec-primary fw-medium"
          disabled={isBusy}
          onClick={onConfirm}
        >
          {isBusy ? 'Waiting for wallet…' : 'Confirm'}
        </button>
        <button
          type="button"
          className="btn btn-text-secondary activate-exec-cancel fw-medium"
          onClick={onCancel}
          disabled={isBusy}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
