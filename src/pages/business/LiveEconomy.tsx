import { useCallback, useEffect, useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import type { Address } from 'viem';

import { AppIcon } from '../../components/icons/AppIcon';
import { Modal } from '../../components/Modal';
import { WalletFlowPageShell } from '../../components/wallet/WalletFlowPageShell';
import { Loader } from '../../components/Loader';
import { useLiveEconomy } from '../../hooks/useLiveEconomy';
import { useWithdrawE1Quote } from '../../hooks/useWithdrawE1Quote';
import { formatUsdWei } from '../../utils/withdrawE1Math';
import { CURRENT_NETWORK_INFO } from '../../config/networks';
import { formatAddressForDisplay } from '../../utils/addressValidation';
import { contracts } from '../../config/wagmi';
import ManagerABI from '../../abis/Manager-titan.json';
import '../../styles/live-economy-page.css';

function formatBigInt(value: bigint) {
  return value.toString();
}

/** Live Economy — current-week Live Forge mining vs prior-week Vault E1 conversion. */
export default function LiveEconomy() {
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
    isLoading: isForgeLoading,
    refetch: refetchForge,
  } = useLiveEconomy();

  const {
    targetWeekId: activeWeekId,
    totalShares,
    pricePerShareUSD,
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
  const isLoading = isForgeLoading || isVaultLoading;

  const resetPending = useCallback(() => {
    setPendingHash(undefined);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchForge(), refetchStocks()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchForge, refetchStocks]);

  useEffect(() => {
    if (!pendingHash || isWaitingForBlock) return;

    if (isTxConfirmed && txReceipt?.status === 'success') {
      void refetchStocks();
      void refetchForge();
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
    refetchForge,
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
        args: [activeWeekId],
        chainId: CURRENT_NETWORK_INFO.chainId,
      });
      setPendingHash(hash as Address);
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Transaction was rejected. Please try again.';
      setErrorMessage(message);
    }
  };

  const explorerTxUrl = successHash
    ? `${CURRENT_NETWORK_INFO.explorer}/tx/${successHash}`
    : null;

  return (
    <WalletFlowPageShell
      title="Live Economy"
      titleMedium
      variant="flat"
      backTo="/"
      headerRight={
        <button
          type="button"
          className="headerButton"
          onClick={() => void handleRefresh()}
          disabled={isRefreshing || isLoading}
          aria-label="Refresh live economy data"
        >
          <AppIcon
            icon="lucide:refresh-cw"
            className={isRefreshing ? 'animate-spin' : undefined}
          />
        </button>
      }
    >
      <div className="live-economy-page finapp-aligned-block section">
        {errorMessage ? (
          <div className="live-economy-status live-economy-status--error" role="alert">
            {errorMessage}
          </div>
        ) : null}

        {successHash ? (
          <div className="live-economy-status live-economy-status--success">
            Conversion confirmed for Week {activeWeekId.toString()}.
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
          <div className="live-economy-status live-economy-status--processing" role="status">
            Processing Transaction...
          </div>
        ) : null}

        {isLoading ? (
          <div className="live-economy-loading">
            <Loader />
          </div>
        ) : (
          <>
            {/* SECTION 1 — THE LIVE FORGE (current week N) */}
            <section className="live-economy-section" aria-labelledby="live-economy-forge">
              <h2 id="live-economy-forge" className="live-economy-section-header">
                <span className="live-economy-section-dot live-economy-section-dot--forge" />
                The Live Forge
              </h2>

              <div className="live-economy-glass-card live-economy-glass-card--forge bg-gray-900/40 backdrop-blur-md w-full">
                <div className="live-economy-card-title">
                  Live Forge (Week {currentWeekId.toString()})
                </div>

                <div className="live-economy-card-hero">
                  <p className="live-economy-card-hero-label">Your Pending GEMs</p>
                  <p className="live-economy-card-hero-value live-economy-card-hero-value--forge">
                    {formatBigInt(userGems)} GEMs
                  </p>
                  <p className="live-economy-card-hero-sub">
                    Estimated total value ${estimatedTotalUsdLabel} USD
                  </p>
                </div>

                <div className="live-economy-row">
                  <span className="live-economy-label">Pending GEMs (This Week)</span>
                  <span className="live-economy-value">{formatBigInt(userGems)}</span>
                </div>
                <div className="live-economy-row">
                  <span className="live-economy-label">Live Estimated GEM Price</span>
                  <span className="live-economy-value">${livePriceLabel}</span>
                </div>
                <div className="live-economy-row">
                  <span className="live-economy-label">Total Estimated USD Value</span>
                  <span className="live-economy-value live-economy-value--highlight-forge">
                    ${estimatedTotalUsdLabel}
                  </span>
                </div>
                {isUsingFloorPrice ? (
                  <div className="live-economy-row">
                    <span className="live-economy-label">Price Basis</span>
                    <span className="live-economy-value">Floor (no GEMs minted yet)</span>
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                className="btn btn-primary btn-block btn-lg finapp-action-btn live-economy-locked-btn w-full"
                disabled
                aria-disabled="true"
              >
                🔒 Mining... Unlocks at End of Week
              </button>
            </section>

            {/* SECTION 2 — THE VAULT (previous week N-1) */}
            <section className="live-economy-section" aria-labelledby="live-economy-vault">
              <h2 id="live-economy-vault" className="live-economy-section-header">
                <span className="live-economy-section-dot live-economy-section-dot--vault" />
                The Vault
              </h2>

              <div className="live-economy-glass-card live-economy-glass-card--vault bg-gray-900/40 backdrop-blur-md w-full">
                <div className="live-economy-card-title live-economy-card-title--vault">
                  The Vault (Week {activeWeekId.toString()})
                </div>

                <div className="live-economy-card-hero">
                  <p className="live-economy-card-hero-label">Priced GEMs Ready</p>
                  <p className="live-economy-card-hero-value live-economy-card-hero-value--vault">
                    {formatBigInt(totalShares)} GEMs
                  </p>
                  <p className="live-economy-card-hero-sub">
                    {isWeekPriced ? 'Final price locked · ready to convert' : 'Awaiting final week price'}
                  </p>
                </div>

                <div className="live-economy-row">
                  <span className="live-economy-label">Exact Priced GEMs</span>
                  <span className="live-economy-value">{formatBigInt(totalShares)}</span>
                </div>
                <div className="live-economy-row">
                  <span className="live-economy-label">Price per GEM (USD)</span>
                  <span className="live-economy-value">
                    ${formatUsdWei(pricePerShareUSD, 4)}
                  </span>
                </div>
                <div className="live-economy-row">
                  <span className="live-economy-label">Exact Final Value (USD)</span>
                  <span className="live-economy-value live-economy-value--highlight-vault">
                    ${grossLabel}
                  </span>
                </div>
                <div className="live-economy-row">
                  <span className="live-economy-label">Fee</span>
                  <span className="live-economy-value">
                    {feePercentLabel} · ${feeLabel}
                  </span>
                </div>
                <div className="live-economy-row">
                  <span className="live-economy-label">Exact Final Value (E1)</span>
                  <span className="live-economy-value live-economy-value--highlight-vault">
                    {netE1Label} E1
                  </span>
                </div>
              </div>

              {!isConnected ? (
                <p className="live-economy-empty">Connect your wallet to convert GEMs to E1.</p>
              ) : !canWithdraw ? (
                <p className="live-economy-empty">
                  No convertible GEMs for Week {activeWeekId.toString()}, or this week was already
                  claimed.
                </p>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary btn-block btn-lg finapp-action-btn live-economy-convert-btn w-full"
                  onClick={() => setConfirmOpen(true)}
                  disabled={walletFlowActive}
                >
                  💎 Convert GEMs to E1
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
            <p className="live-economy-modal-copy mb-0">
              You are authorizing us to burn your Week {activeWeekId.toString()} GEMs in exchange
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
