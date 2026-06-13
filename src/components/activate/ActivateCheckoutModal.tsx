import { AppIcon } from '../icons/AppIcon';
import React from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { GlassCard } from '../ui/glass';
import { ActivateE1Logo } from './ActivateE1Logo';
import { ActivateLockMessage } from './ActivateLockMessage';
import {
  REALM_VALIDITY_DAYS_PER_UNIT,
  formatRealmDayLabel,
  getRealmDisplayName,
  parseRealmGroupNumber,
  type StoreRealmProduct,
} from '../../data/storeRealmProducts';
import { formatAmountSmart } from '../../utils/formatNumber';
import { useRealmActivationEligibility } from '../../hooks/useRealmActivationEligibility';
import { useUserGroupRemainingDays } from '../../hooks/useUserGroupRemainingDays';
import {
  formatE1BalanceDisplay,
  useActivatePaymentRoute,
} from '../../hooks/useActivatePaymentRoute';

export interface ActivateCheckoutModalProps {
  product: StoreRealmProduct;
  onClose: () => void;
  onRenewalConfirm: (priceWei: bigint, priceE1: number) => void;
  networkFeePOL: number | null;
}

export function ActivateCheckoutModal({
  product,
  onClose,
  onRenewalConfirm,
  networkFeePOL,
}: ActivateCheckoutModalProps) {
  const { address, isConnected } = useAccount();
  const groupIdx = parseRealmGroupNumber(product.level);
  const realmName = getRealmDisplayName(product.name);
  const eligibility = useRealmActivationEligibility(groupIdx);
  const payment = useActivatePaymentRoute(groupIdx);
  const { packagePrice, activationKind, route: paymentRoute } = payment;

  const yourLifeDays = useUserGroupRemainingDays(groupIdx);
  const purchaseDays = REALM_VALIDITY_DAYS_PER_UNIT;
  const newLifeDays = yourLifeDays + purchaseDays;

  const balanceE1 = formatE1BalanceDisplay(payment.e1BalanceRaw as bigint | undefined);

  const canProceedE1 =
    isConnected &&
    eligibility.canActivate &&
    paymentRoute === 'e1-checkout' &&
    packagePrice.priceWei != null &&
    packagePrice.priceE1 != null;

  const loading = paymentRoute === 'loading';

  let actionMessage: string | null = null;
  if (!isConnected) actionMessage = 'Connect wallet';
  else if (!eligibility.canActivate) actionMessage = eligibility.lockReason;
  else if (loading) actionMessage = 'Reading balances…';
  else if (paymentRoute === 'e1-insufficient') {
    if (packagePrice.isError || packagePrice.priceWei == null) {
      actionMessage = 'Unable to load package price';
    }
  } else if (paymentRoute === 'e1-checkout') {
    if (packagePrice.isError || packagePrice.priceWei == null) {
      actionMessage = 'Unable to load package price';
    }
  }

  const modalTitleSuffix =
    paymentRoute === 'e1-checkout' && activationKind.isRenewal ? 'Renewal' : 'Activation';

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="activate-modal-title"
    >
      <GlassCard glowColor="blue" className="activate-stage-card max-h-[90vh] w-full max-w-md overflow-y-auto">
        <div className="relative p-5">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-white/20 text-gray-600 backdrop-blur-md"
            aria-label="Close"
          >
            <AppIcon icon="lucide:x" className="h-4 w-4" />
          </button>

          <h2 id="activate-modal-title" className="activate-flow-text mb-1 pr-8 text-center text-lg">
            {modalTitleSuffix} — {realmName}
          </h2>
          <p className="activate-flow-muted mb-4 text-center text-[13px]">
            Pay with E1 only · Buy credit cards with ERX on E-Dex
          </p>

          <div className="activate-details-table-section mb-4">
            <div className="table-responsive">
              <table className="table activate-details-table">
                <thead>
                  <tr>
                    <th scope="col">Your Life</th>
                    <th scope="col">Time</th>
                    <th scope="col">New Life</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{formatRealmDayLabel(yourLifeDays)}</td>
                    <td>{formatRealmDayLabel(purchaseDays)}</td>
                    <td>{formatRealmDayLabel(newLifeDays)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-4 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="activate-flow-muted">
                {activationKind.isRenewal ? 'Renewal (E1)' : 'Package (E1)'}
              </span>
              <span className="activate-flow-text flex items-center gap-1.5">
                {packagePrice.isLoading ? (
                  '…'
                ) : packagePrice.priceE1 != null ? (
                  <>
                    {formatAmountSmart(packagePrice.priceE1)}
                    <ActivateE1Logo className="h-5 w-auto" />
                  </>
                ) : (
                  '—'
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="activate-flow-muted">Your E1 Balance</span>
              <span className="activate-flow-text">
                {balanceE1 != null ? formatAmountSmart(balanceE1) : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="activate-flow-muted">Est. Network Fee</span>
              <span className="activate-flow-text">
                {networkFeePOL != null ? `~${networkFeePOL.toFixed(4)} POL` : 'Calculating…'}
              </span>
            </div>
          </div>

          {paymentRoute === 'e1-insufficient' &&
            !packagePrice.isLoading &&
            packagePrice.priceWei != null && (
              <div className="mb-4 rounded-xl border border-[#FF396F]/30 bg-[#FF396F]/10 p-3 text-center">
                <p className="activate-flow-text mb-2 text-[13px]">
                  Your E1 is not enough for activation. To obtain the required E1, purchase a credit
                  card from EDex or from products in the store, then return it here.
                </p>
                <Link
                  to="/edex"
                  className="btn btn-primary btn-sm activate-continue-btn inline-block"
                  onClick={onClose}
                >
                  EDex
                </Link>
              </div>
            )}

          {actionMessage &&
            (paymentRoute === 'e1-checkout' ||
              (paymentRoute === 'e1-insufficient' && packagePrice.isError)) &&
            (!eligibility.canActivate && eligibility.lockReason ? (
              <ActivateLockMessage className="mb-3">{actionMessage}</ActivateLockMessage>
            ) : (
              <p className="activate-flow-muted mb-3 text-center text-[13px] text-[#FF396F]">
                {actionMessage}
              </p>
            ))}

          {loading ? (
            <p className="activate-flow-muted mb-3 text-center text-[13px]">Reading balances…</p>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-block btn-lg activate-continue-btn w-full"
              disabled={!canProceedE1}
              onClick={() => {
                if (packagePrice.priceWei == null || packagePrice.priceE1 == null) return;
                onRenewalConfirm(packagePrice.priceWei, packagePrice.priceE1);
              }}
            >
              Continue to Invoice
            </button>
          )}

          <p className="activate-encrypted-session activate-flow-muted mt-3 flex items-center justify-center gap-1 text-center">
            <AppIcon icon="lucide:shield-check" className="activate-encrypted-session-icon" /> Encrypted Web3 Session
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
