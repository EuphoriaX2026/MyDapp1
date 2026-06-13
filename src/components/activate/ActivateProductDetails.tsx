import React from 'react';
import { Link } from 'react-router-dom';
import { GlassCard } from '../ui/glass';
import { ActivateE1Logo } from './ActivateE1Logo';
import {
  REALM_VALIDITY_DAYS_PER_UNIT,
  formatRealmDayLabel,
  getRealmDisplayName,
  parseRealmGroupNumber,
  type StoreRealmProduct,
} from '../../data/storeRealmProducts';
import { formatAmountSmart } from '../../utils/formatNumber';
import { useActivatorPackagePrice } from '../../hooks/useActivatorPackagePrice';
import { useRealmActivationEligibility } from '../../hooks/useRealmActivationEligibility';
import { useUserGroupRemainingDays } from '../../hooks/useUserGroupRemainingDays';
import {
  formatE1BalanceDisplay,
  useActivatePaymentRoute,
} from '../../hooks/useActivatePaymentRoute';
import { ActivateLockMessage } from './ActivateLockMessage';

export interface ActivateProductDetailsProps {
  product: StoreRealmProduct;
  onProceedToInvoice: (
    product: StoreRealmProduct,
    priceWei: bigint,
    priceE1: number,
    isRenewal: boolean,
  ) => void;
  networkFeePOL?: number | null;
}

export function ActivateProductDetails({
  product,
  onProceedToInvoice,
  networkFeePOL = null,
}: ActivateProductDetailsProps) {
  const groupIdx = parseRealmGroupNumber(product.level);
  const realmName = getRealmDisplayName(product.name);
  const eligibility = useRealmActivationEligibility(groupIdx);
  const priceQuote = useActivatorPackagePrice(groupIdx);
  const payment = useActivatePaymentRoute(groupIdx);
  const { activationKind, route: paymentRoute } = payment;
  const yourLifeDays = useUserGroupRemainingDays(groupIdx);
  const purchaseDays = REALM_VALIDITY_DAYS_PER_UNIT;
  const newLifeDays = yourLifeDays + purchaseDays;

  const balanceE1 = formatE1BalanceDisplay(payment.e1BalanceRaw as bigint | undefined);

  const titleSuffix =
    paymentRoute === 'e1-checkout' && activationKind.isRenewal ? 'Renewal' : 'Activation';

  const canProceedE1 =
    eligibility.canActivate &&
    paymentRoute === 'e1-checkout' &&
    priceQuote.priceWei != null &&
    priceQuote.priceE1 != null;

  const activateDisabled =
    !canProceedE1 ||
    priceQuote.isLoading ||
    priceQuote.isError;

  return (
    <div className="activate-product-details">
      <div className="activate-details-header">
        <h3 className="activate-details-heading fw-medium">
          {titleSuffix} — {realmName}
        </h3>
        <p className="activate-details-subtitle fw-normal">
          Pay with E1 only · Buy credit cards with ERX on E-Dex
        </p>
      </div>

      <GlassCard glowColor="blue" className="activate-stage-card activate-details-glass w-full">
        <div className="activate-details-glass-inner">
          <div className="activate-details-table-section">
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
        </div>
      </GlassCard>

      <div className="activate-details-balance-rows">
        <div className="activate-details-balance-row">
          <span className="activate-flow-muted">Your E1 Balance</span>
          <span className="activate-flow-text activate-exec-e1-value">
            {balanceE1 != null ? formatAmountSmart(balanceE1) : '—'}
            <ActivateE1Logo className="activate-invoice-e1-logo h-4 w-auto" />
          </span>
        </div>
        <div className="activate-details-balance-row">
          <span className="activate-flow-muted">Est. Network Fee</span>
          <span className="activate-flow-text">
            {networkFeePOL != null ? `~${networkFeePOL.toFixed(4)} POL` : 'Calculating…'}
          </span>
        </div>
      </div>

      {paymentRoute === 'e1-insufficient' &&
        !priceQuote.isLoading &&
        priceQuote.priceWei != null && (
          <div className="mb-3 rounded-xl border border-[#FF396F]/30 bg-[#FF396F]/10 p-3 text-center">
            <p className="activate-flow-text mb-2 text-[13px]">
              Your E1 is not enough for activation. To obtain the required E1, purchase a credit card
              from EDex or from products in the store, then return it here.
            </p>
            <Link to="/edex" className="btn btn-primary btn-sm activate-continue-btn inline-block">
              EDex
            </Link>
          </div>
        )}

      {!eligibility.canActivate && eligibility.lockReason && (
        <ActivateLockMessage>{eligibility.lockReason}</ActivateLockMessage>
      )}

      <button
        type="button"
        onClick={() => {
          if (!priceQuote.priceWei || priceQuote.priceE1 == null) return;
          onProceedToInvoice(
            product,
            priceQuote.priceWei,
            priceQuote.priceE1,
            activationKind.isRenewal,
          );
        }}
        disabled={activateDisabled}
        className="btn btn-primary btn-block btn-lg activate-continue-btn finapp-action-btn disabled:opacity-50"
      >
        {eligibility.isLoading || priceQuote.isLoading || paymentRoute === 'loading'
          ? 'Loading…'
          : `Activate ${getRealmDisplayName(product.name)}`}
      </button>
    </div>
  );
}
