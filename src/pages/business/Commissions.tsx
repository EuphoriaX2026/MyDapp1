import { useCallback, useEffect, useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import type { Address } from 'viem';

import { AppIcon } from '../../components/icons/AppIcon';
import { Modal } from '../../components/Modal';
import { WalletFlowPageShell } from '../../components/wallet/WalletFlowPageShell';
import { Loader } from '../../components/Loader';
import { useLiveEconomy } from '../../hooks/useLiveEconomy';
import { useWithdrawE1Quote } from '../../hooks/useWithdrawE1Quote';
import { getGroupLevelLabel } from '../../data/storeRealmProducts';
import { formatUsdWei } from '../../utils/withdrawE1Math';
import { CURRENT_NETWORK_INFO } from '../../config/networks';
import { formatAddressForDisplay } from '../../utils/addressValidation';
import { contracts } from '../../config/wagmi';
import ManagerABI from '../../abis/Manager-titan.json';
import { BUSINESS_COMMISSIONS_PATH } from '../../config/businessHubRoutes';
import '../../styles/commissions-page.css';

export const COMMISSIONS_PATH = BUSINESS_COMMISSIONS_PATH;

function formatBigInt(value: bigint) {
  return value.toString();
}

/** Business Hub — live GEM economy dashboard and E1 conversion vault. */
export default function Commissions() {
  const { isConnected } = useAccount();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successHash, setSuccessHash] = useState<`0x${string}` | null>(null);
  const [pendingHash, setPendingHash] = useState<Address | undefined>();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    currentWeekId,
    userGems,
    livePriceLabel,
    estimatedTotalUsdLabel,
    isUsingFloorPrice,
    isLoading: isLiveLoading,
    refetch: refetchLive,
  } = useLiveEconomy();

  const {
    targetWeekId,
    totalShares,
    pricePerShareUSD,
    highestActiveGroup,
    baseCapUsd,
    vipCapUsd,
    isSubjectToLifeFee,
    lifetimeWithdrawalsLabel,
    grossLabel,
    feeLabel,
    netE1Label,
    feePercentLabel,
    canWithdraw,
    isWeekPriced,
    isLoading: isVaultLoading,
    refetchStocks,
  } = useWithdrawE1Quote();

  const { isPending, writeContractAsync } = useWriteContract();
  const {
    isLoading: isWaitingForBlock,
    isSuccess: isTxConfirmed,
    isError: isTxFailed,
    data: txReceipt,
  } = useWaitForTransactionReceipt({ hash: pendingHash });

  const walletFlowActive = isPending || isWaitingForBlock;
  const isLoading = isLiveLoading || isVaultLoading;

  const resetPending = useCallback(() => {
    setPendingHash(undefined);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchLive(), refetchStocks()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchLive, refetchStocks]);

  useEffect(() => {
    if (!pendingHash || isWaitingForBlock) return;

    if (isTxConfirmed && txReceipt?.status === 'success') {
      void refetchStocks();
      void refetchLive();
      setSuccessHash(pendingHash);
      setErrorMessage(null);
      resetPending();
      return;
    }

    if (isTxFailed || txReceipt?.status === 'reverted') {
      setErrorMessage('Transaction failed on-chain. Please try again.');
      resetPending();
    }
  }, [
    pendingHash,
    isWaitingForBlock,
    isTxConfirmed,
    isTxFailed,
    txReceipt,
    refetchStocks,
    refetchLive,
    resetPending,
  ]);

  const handleConfirmWithdraw = async () => {
    setConfirmOpen(false);
    if (!canWithdraw || walletFlowActive) return;
    setErrorMessage(null);
    setSuccessHash(null);

    try {
      const hash = await writeContractAsync({
        address: contracts.TITAN_MANAGER as `0x${string}`,
        abi: ManagerABI.abi,
        functionName: 'claimWeeklySharePayout',
        args: [targetWeekId],
        chainId: CURRENT_NETWORK_INFO.chainId,
      });
      setPendingHash(hash as Address);
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Transaction was rejected. Please try again.';
      setErrorMessage(message);
    }
  };

  const highestRealmName =
    highestActiveGroup > 0 ? getGroupLevelLabel(highestActiveGroup) : '—';

  const explorerTxUrl = successHash
    ? `${CURRENT_NETWORK_INFO.explorer}/tx/${successHash}`
    : null;

  return (
    <WalletFlowPageShell
      title="Commissions"
      titleMedium
      variant="flat"
      backTo="/"
      headerRight={
        <button
          type="button"
          className="headerButton"
          onClick={() => void handleRefresh()}
          disabled={isRefreshing || isLoading}
          aria-label="Refresh commissions data"
        >
          <AppIcon
            icon="lucide:refresh-cw"
            className={isRefreshing ? 'animate-spin' : undefined}
          />
        </button>
      }
    >
      <div className="commissions-page finapp-aligned-block section">
        {errorMessage ? (
          <div className="commissions-status commissions-status--error" role="alert">
            {errorMessage}
          </div>
        ) : null}

        {successHash ? (
          <div className="commissions-status commissions-status--success">
            Conversion confirmed for Week {targetWeekId.toString()}.
            {explorerTxUrl ? (
              <>
                {' '}
                <a href={explorerTxUrl} target="_blank" rel="noopener noreferrer">
                  {formatAddressForDisplay(successHash, 8, 6)}
                </a>
              </>
            ) : null}
          </div>
        ) : null}

        {walletFlowActive ? (
          <div className="commissions-status commissions-status--processing" role="status">
            Processing Transaction...
          </div>
        ) : null}

        {isLoading ? (
          <div className="commissions-loading">
            <Loader />
          </div>
        ) : (
          <>
            {/* SECTION 1 — THE LIVE FORGE */}
            <section className="commissions-section" aria-labelledby="commissions-live-forge">
              <h2 id="commissions-live-forge" className="commissions-section-header">
                <span className="commissions-section-dot commissions-section-dot--live" />
                The Live Forge
              </h2>
              <p className="commissions-section-desc">
                Current week mining — live GEM price estimate from on-chain revenue and total GEMs
                minted this week. Conversion unlocks when the week closes and pricing finalizes.
              </p>

              <div className="commissions-glass-card commissions-glass-card--live bg-gray-900/40 backdrop-blur-xl w-full">
                <div className="commissions-card-hero">
                  <p className="commissions-card-hero-label">Current Week Mining</p>
                  <p className="commissions-card-hero-value commissions-card-hero-value--accent-live">
                    {formatBigInt(userGems)} GEMs
                  </p>
                  <p className="commissions-card-hero-sub">
                    Week {currentWeekId.toString()} · estimated value ${estimatedTotalUsdLabel} USD
                  </p>
                </div>

                <div className="commissions-row">
                  <span className="commissions-label">Week ID</span>
                  <span className="commissions-value">{currentWeekId.toString()}</span>
                </div>
                <div className="commissions-row">
                  <span className="commissions-label">Your GEMs</span>
                  <span className="commissions-value">{formatBigInt(userGems)}</span>
                </div>
                <div className="commissions-row">
                  <span className="commissions-label">Live Estimated GEM Price</span>
                  <span className="commissions-value">${livePriceLabel}</span>
                </div>
                <div className="commissions-row">
                  <span className="commissions-label">Estimated Total Value</span>
                  <span className="commissions-value commissions-value--highlight">
                    ${estimatedTotalUsdLabel}
                  </span>
                </div>
                {isUsingFloorPrice ? (
                  <div className="commissions-row">
                    <span className="commissions-label">Price Basis</span>
                    <span className="commissions-value">Floor (no GEMs minted yet)</span>
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                className="btn btn-primary btn-block btn-lg finapp-action-btn commissions-locked-btn w-full"
                disabled
                aria-disabled="true"
              >
                🔒 Unlocks at End of Week
              </button>
            </section>

            {/* SECTION 2 — THE VAULT */}
            <section className="commissions-section" aria-labelledby="commissions-vault">
              <h2 id="commissions-vault" className="commissions-section-header">
                <span className="commissions-section-dot commissions-section-dot--vault" />
                The Vault
              </h2>
              <p className="commissions-section-desc">
                Previous week — priced GEMs ready for E1 conversion via Manager.claimWeeklySharePayout.
                Stars calculation is handled separately under Ranks &amp; Stars.
              </p>

              <div className="commissions-glass-card commissions-glass-card--vault bg-gray-900/40 backdrop-blur-xl w-full">
                <div className="commissions-card-hero">
                  <p className="commissions-card-hero-label">Available to Convert</p>
                  <p className="commissions-card-hero-value commissions-card-hero-value--accent-vault">
                    {formatBigInt(totalShares)} GEMs
                  </p>
                  <p className="commissions-card-hero-sub">
                    Week {targetWeekId.toString()}
                    {isWeekPriced ? ' · priced & ready' : ' · awaiting final price'}
                  </p>
                </div>

                <div className="commissions-row">
                  <span className="commissions-label">Week ID</span>
                  <span className="commissions-value">{targetWeekId.toString()}</span>
                </div>
                <div className="commissions-row">
                  <span className="commissions-label">Priced GEMs</span>
                  <span className="commissions-value">{formatBigInt(totalShares)}</span>
                </div>
                <div className="commissions-row">
                  <span className="commissions-label">Price per GEM (USD)</span>
                  <span className="commissions-value">
                    ${formatUsdWei(pricePerShareUSD, 4)}
                  </span>
                </div>
                <div className="commissions-row">
                  <span className="commissions-label">Gross Value</span>
                  <span className="commissions-value commissions-value--highlight">
                    ${grossLabel}
                  </span>
                </div>
                <div className="commissions-row">
                  <span className="commissions-label">Highest Active Group</span>
                  <span className="commissions-value">{highestRealmName}</span>
                </div>
                <div className="commissions-row">
                  <span className="commissions-label">Base Cap</span>
                  <span className="commissions-value">${formatUsdWei(baseCapUsd)}</span>
                </div>
                <div className="commissions-row">
                  <span className="commissions-label">VIP Cap</span>
                  <span className="commissions-value">${formatUsdWei(vipCapUsd)}</span>
                </div>
                <div className="commissions-row">
                  <span className="commissions-label">Lifetime Withdrawals (USD)</span>
                  <span className="commissions-value">{lifetimeWithdrawalsLabel}</span>
                </div>
                {isSubjectToLifeFee ? (
                  <div className="commissions-row">
                    <span className="commissions-label">Life Fee Applies</span>
                    <span className="commissions-value">Yes</span>
                  </div>
                ) : null}
                <div className="commissions-row">
                  <span className="commissions-label">Fee</span>
                  <span className="commissions-value">
                    {feePercentLabel} · ${feeLabel}
                  </span>
                </div>
                <div className="commissions-row">
                  <span className="commissions-label">Net Payout (E1)</span>
                  <span className="commissions-value commissions-value--highlight">
                    {netE1Label} E1
                  </span>
                </div>
              </div>

              {!isConnected ? (
                <p className="commissions-empty">Connect your wallet to convert GEMs to E1.</p>
              ) : !canWithdraw ? (
                <p className="commissions-empty">
                  No convertible GEMs for Week {targetWeekId.toString()}, or this week was already
                  claimed.
                </p>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary btn-block btn-lg finapp-action-btn commissions-convert-btn w-full"
                  onClick={() => setConfirmOpen(true)}
                  disabled={walletFlowActive}
                >
                  Convert GEMs to E1
                </button>
              )}
            </section>
          </>
        )}

        <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <div className="modal-header">
            <h5 className="modal-title">Confirm Conversion</h5>
          </div>
          <div className="modal-body text-start">
            <p className="commissions-section-desc mb-0">
              You are authorizing us to burn your Week {targetWeekId.toString()} GEMs in exchange
              for <strong>{netE1Label} E1</strong>. Confirm?
            </p>
          </div>
          <div className="modal-footer">
            <div className="btn-inline">
              <button
                type="button"
                className="btn btn-text-secondary"
                onClick={() => setConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-text-primary"
                onClick={handleConfirmWithdraw}
              >
                Confirm
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </WalletFlowPageShell>
  );
}
