import { AppIcon } from '../icons/AppIcon';
import OutlinePendingActionsIcon from '@iconify-react/ic/outline-pending-actions';
import SwapIcon from '@iconify-react/tdesign/swap';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { EdexTokenMeta } from '../../config/edex-tokens';
import { CURRENT_NETWORK_INFO } from '../../config/networks';
import { formatAddressForDisplay } from '../../utils/addressValidation';
import { EdexApproveBadgeIcon } from './EdexApproveBadgeIcon';
import { EdexApproveSuccessIcon } from './EdexApproveSuccessIcon';
import '../../styles/edex-swap-review.css';

export type EdexReviewKind = 'approve' | 'swap';
export type ApproveLayout = 'badge' | 'swap-style';

const EDEX_APPROVE_WALLET_HINT =
  'Your wallet is only opened for signature. All amounts are displayed to you in the Dapp environment before final confirmation on the blockchain.';

const SHEET_ANIM_MS = 390;

function getSheetPortalRoot(): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  return document.querySelector('.invisible-mobile-frame') ?? document.body;
}

export interface EdexSwapReviewSheetProps {
  open: boolean;
  kind: EdexReviewKind;
  payToken: EdexTokenMeta;
  receiveToken: EdexTokenMeta;
  payAmount: string;
  receiveAmount: string;
  feeText?: string;
  rateText?: string;
  spenderLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  isBusy?: boolean;
  approveSuccessHash?: `0x${string}`;
  sectionLabel?: string;
  onApproveContinue?: () => void;
  /** Pending approve UI: badge (EDex default) or swap-style (Activate E1). */
  approveLayout?: ApproveLayout;
  approveSubtitleLines?: [string, string];
}

function ApproveSuccessRows({
  sectionLabel,
  txHash,
}: {
  sectionLabel: string;
  txHash: `0x${string}`;
}) {
  const explorerTxUrl = `${CURRENT_NETWORK_INFO.explorer}/tx/${txHash}`;

  return (
    <ul className="edex-review-rows">
      <li>
        <span className="edex-review-row-label">Status</span>
        <span className="edex-review-row-value edex-review-row-value--success">Success</span>
      </li>
      <li>
        <span className="edex-review-row-label">Section</span>
        <span className="edex-review-row-value">{sectionLabel}</span>
      </li>
      <li>
        <span className="edex-review-row-label">Action</span>
        <span className="edex-review-row-value">Token approval</span>
      </li>
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
    </ul>
  );
}

function ReviewRows({
  payAmount,
  payToken,
  receiveAmount,
  receiveToken,
  feeText,
  rateText,
  showApprovalType,
}: {
  payAmount: string;
  payToken: EdexTokenMeta;
  receiveAmount: string;
  receiveToken: EdexTokenMeta;
  feeText?: string;
  rateText?: string;
  showApprovalType?: boolean;
}) {
  return (
    <ul className="edex-review-rows">
      <li>
        <span className="edex-review-row-label">You pay</span>
        <span className="edex-review-row-value">
          {payAmount} {payToken.symbol}
        </span>
      </li>
      <li>
        <span className="edex-review-row-label">You receive</span>
        <span className="edex-review-row-value edex-review-row-value--success">
          {receiveAmount} {receiveToken.symbol}
        </span>
      </li>
      {feeText ? (
        <li>
          <span className="edex-review-row-label">Protocol fee</span>
          <span className="edex-review-row-value">{feeText}</span>
        </li>
      ) : null}
      {rateText ? (
        <li>
          <span className="edex-review-row-label">Rate</span>
          <span className="edex-review-row-value edex-review-row-value--small">{rateText}</span>
        </li>
      ) : null}
      {showApprovalType ? (
        <li>
          <span className="edex-review-row-label">Approval type</span>
          <span className="edex-review-row-value">Unlimited (one-time)</span>
        </li>
      ) : null}
    </ul>
  );
}

export function EdexSwapReviewSheet({
  open,
  kind,
  payToken,
  receiveToken,
  payAmount,
  receiveAmount,
  feeText,
  rateText,
  spenderLabel = 'EDex',
  onConfirm,
  onClose,
  isBusy = false,
  approveSuccessHash,
  sectionLabel = 'EDex',
  onApproveContinue,
  approveLayout = 'badge',
  approveSubtitleLines,
}: EdexSwapReviewSheetProps) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(frame);
    }

    setVisible(false);
    const timer = window.setTimeout(() => setMounted(false), SHEET_ANIM_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  if (!mounted || typeof document === 'undefined') return null;

  const portalRoot = getSheetPortalRoot();
  if (!portalRoot) return null;

  const isSwapStyleApprove = kind === 'approve' && approveLayout === 'swap-style';
  const title = kind === 'approve' ? 'Approve' : 'Swap';
  const badgeApproveSubtitle =
    kind === 'approve' && !isSwapStyleApprove
      ? `Unlimited ${payToken.symbol} approval for ${spenderLabel}.`
      : null;
  const swapStyleApproveSubtitle = approveSubtitleLines ?? [
    'Check the amounts below, if approved',
    'click the Confirm button to complete the activation.',
  ];

  const primaryLabel = isBusy
    ? 'Waiting for wallet…'
    : kind === 'approve' && !isSwapStyleApprove
      ? 'Approve'
      : 'Confirm';

  const walletHint =
    kind === 'approve' && !isSwapStyleApprove
      ? EDEX_APPROVE_WALLET_HINT
      : 'Your wallet will open only to sign. All amounts are shown here in Dapp before you confirm.';

  const isApproveSuccess = kind === 'approve' && !!approveSuccessHash;
  const showOuterActions =
    kind !== 'approve' || (isSwapStyleApprove && !isApproveSuccess);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isBusy) return;
    if (e.target === e.currentTarget) onClose();
  };

  return createPortal(
    <div
      className={`edex-review-sheet${visible ? ' edex-review-sheet--visible' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edex-review-sheet-title"
      onClick={handleBackdropClick}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && !isBusy) onClose();
      }}
    >
      <div className="edex-review-overlay" aria-hidden="true" />

      <div className="edex-review-dialog">
        <div className="edex-review-content" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="edex-review-close"
            onClick={onClose}
            aria-label="Close"
            disabled={isBusy}
          >
            <AppIcon icon="lucide:x" />
          </button>

          <div className="edex-review-body">
            {kind === 'approve' ? (
              isApproveSuccess ? (
                <div className="edex-approve-card">
                  <div className="edex-approve-badge edex-approve-badge--success" aria-hidden="true">
                    <EdexApproveSuccessIcon />
                  </div>
                  <ApproveSuccessRows sectionLabel={sectionLabel} txHash={approveSuccessHash} />
                  <div className="edex-review-actions">
                    <button
                      type="button"
                      className="btn btn-primary btn-lg edex-review-primary fw-medium"
                      onClick={onApproveContinue}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              ) : isSwapStyleApprove ? (
                <>
                  <div
                    className="edex-review-iconbox edex-review-iconbox--swap edex-review-iconbox--pending"
                    aria-hidden="true"
                  >
                    <OutlinePendingActionsIcon height="3rem" width="3rem" />
                  </div>
                  <h2
                    id="edex-review-sheet-title"
                    className="edex-review-title edex-review-title--swap fw-bold"
                  >
                    {title}
                  </h2>
                  <p className="edex-review-subtitle edex-review-subtitle--swap fw-normal">
                    <span className="edex-review-subtitle-line">{swapStyleApproveSubtitle[0]}</span>
                    <span className="edex-review-subtitle-line">{swapStyleApproveSubtitle[1]}</span>
                  </p>
                  <div className="edex-review-panel">
                    <ReviewRows
                      payAmount={payAmount}
                      payToken={payToken}
                      receiveAmount={receiveAmount}
                      receiveToken={receiveToken}
                      feeText={feeText}
                      rateText={rateText}
                    />
                  </div>
                </>
              ) : (
                <div className="edex-approve-card">
                  <div className="edex-approve-badge" aria-hidden="true">
                    <EdexApproveBadgeIcon />
                  </div>
                  <h2 id="edex-review-sheet-title" className="edex-review-title fw-bold">
                    {title}
                  </h2>
                  <p className="edex-review-subtitle fw-normal">{badgeApproveSubtitle}</p>
                  <ReviewRows
                    payAmount={payAmount}
                    payToken={payToken}
                    receiveAmount={receiveAmount}
                    receiveToken={receiveToken}
                    feeText={feeText}
                    rateText={rateText}
                    showApprovalType
                  />
                  <p className="edex-review-wallet-hint fw-normal">{walletHint}</p>
                  <div className="edex-review-actions">
                    <button
                      type="button"
                      className="btn btn-primary btn-lg edex-review-primary fw-medium"
                      disabled={isBusy}
                      onClick={onConfirm}
                    >
                      {primaryLabel}
                    </button>
                    <button
                      type="button"
                      className="btn btn-text-secondary edex-review-cancel fw-medium"
                      onClick={onClose}
                      disabled={isBusy}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )
            ) : (
              <>
                <div className="edex-review-iconbox edex-review-iconbox--swap" aria-hidden="true">
                  <SwapIcon height="3rem" width="3rem" />
                </div>
                <h2
                  id="edex-review-sheet-title"
                  className="edex-review-title edex-review-title--swap fw-bold"
                >
                  {title}
                </h2>
                <p className="edex-review-subtitle edex-review-subtitle--swap fw-normal">
                  <span className="edex-review-subtitle-line">Check the amounts below, if approved</span>
                  <span className="edex-review-subtitle-line">
                    click the Confirm button to complete the exchange.
                  </span>
                </p>
                <div className="edex-review-panel">
                  <ReviewRows
                    payAmount={payAmount}
                    payToken={payToken}
                    receiveAmount={receiveAmount}
                    receiveToken={receiveToken}
                    feeText={feeText}
                    rateText={rateText}
                  />
                </div>
              </>
            )}

            {showOuterActions ? (
              <>
                <p className="edex-review-wallet-hint fw-normal">{walletHint}</p>
                <div className="edex-review-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-lg edex-review-primary fw-medium"
                    disabled={isBusy}
                    onClick={onConfirm}
                  >
                    {primaryLabel}
                  </button>
                  <button
                    type="button"
                    className="btn btn-text-secondary edex-review-cancel fw-medium"
                    onClick={onClose}
                    disabled={isBusy}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>,
    portalRoot,
  );
}
