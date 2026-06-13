import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, type Address } from 'viem';

import { WalletFlowPageShell } from '../../components/wallet/WalletFlowPageShell';
import { Loader } from '../../components/Loader';
import { usePointsMatrix } from '../../hooks/usePointsMatrix';
import { useGroupActivationStatus } from '../../hooks/useGroupActivationStatus';
import { useWeeklyRftStocks } from '../../hooks/useWeeklyRftStocks';
import { useRftIncome } from '../../hooks/useRftIncome';
import { getGroupLevelLabel } from '../../data/storeRealmProducts';
import { CURRENT_NETWORK_INFO } from '../../config/networks';
import { formatAddressForDisplay } from '../../utils/addressValidation';
import PanelABI from '../../abis/Panel-titan.json';
import ManagerABI from '../../abis/Manager-titan.json';
import LensABI from '../../abis/Lens-titan.json';
import { contracts } from '../../config/wagmi';
import '../../styles/send-money-page.css';
import '../../styles/checking-credit-page.css';

const GROUP_IDS = [1, 2, 3, 4, 5, 6, 7] as const;

function formatBigInt(value: bigint) {
  return value.toString();
}

function formatUsdFromShares(shares: bigint, priceUsd: number) {
  const amount = Number(shares) * priceUsd;
  return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CheckingCredit() {
  const { isConnected } = useAccount();
  const [selectedWeekId, setSelectedWeekId] = useState<bigint | null>(null);
  const [pendingHash, setPendingHash] = useState<Address | undefined>();
  const [pendingAction, setPendingAction] = useState<'process' | 'withdraw' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [withdrawSuccessHash, setWithdrawSuccessHash] = useState<`0x${string}` | null>(null);

  const { groupsData, isLoading: isPointsLoading, refetch: refetchPoints } = usePointsMatrix();
  const { groups: activationGroups, isLoading: isActivationLoading, refetch: refetchActivation } =
    useGroupActivationStatus();
  const {
    minSelectableWeekId,
    maxSelectableWeekId,
    isLoading: isWeekLoading,
  } = useRftIncome();

  const minWeekId = minSelectableWeekId;
  const maxWeekId = maxSelectableWeekId;
  const activeWeekId = selectedWeekId ?? maxWeekId;

  const {
    stocksByGroup,
    totalShares,
    hasClaimedWeek,
    isLoading: isStocksLoading,
    refetch: refetchWeeklyStocks,
  } = useWeeklyRftStocks(activeWeekId);

  const { isPending, writeContractAsync } = useWriteContract();
  const {
    isLoading: isWaitingForBlock,
    isSuccess: isTxConfirmed,
    isError: isTxFailed,
    data: txReceipt,
  } = useWaitForTransactionReceipt({ hash: pendingHash });

  const { data: rftPriceData } = useReadContract({
    address: contracts.TITAN_LENS as `0x${string}`,
    abi: LensABI.abi,
    functionName: 'getRftFloorPrice',
  });

  const { data: claimFeeBpsRaw } = useReadContract({
    address: contracts.TITAN_PANEL as `0x${string}`,
    abi: PanelABI.abi,
    functionName: 'getClaimFeeBPS',
  });

  useEffect(() => {
    if (!isWeekLoading && selectedWeekId === null) {
      setSelectedWeekId(maxWeekId >= minWeekId ? maxWeekId : minWeekId);
    }
  }, [isWeekLoading, maxWeekId, minWeekId, selectedWeekId]);

  const rftPriceUsd = rftPriceData ? Number(formatUnits(rftPriceData as bigint, 18)) : 0;
  const claimFeeBps = Number((claimFeeBpsRaw as bigint | undefined) ?? 0n);
  const totalValueUsd = Number(totalShares) * rftPriceUsd;
  const feeUsd = totalValueUsd * (claimFeeBps / 10_000);
  const netUsd = totalValueUsd - feeUsd;

  const isDataLoading =
    isPointsLoading || isActivationLoading || isStocksLoading || isWeekLoading || selectedWeekId === null;
  const walletFlowActive = isPending || isWaitingForBlock;
  const canClaimWeek = totalShares > 0n && !hasClaimedWeek;

  const resetPending = useCallback(() => {
    setPendingHash(undefined);
    setPendingAction(null);
  }, []);

  const refetchAll = useCallback(async () => {
    await Promise.all([
      refetchPoints(),
      refetchActivation(),
      refetchWeeklyStocks(),
    ]);
  }, [refetchPoints, refetchActivation, refetchWeeklyStocks]);

  useEffect(() => {
    if (!pendingHash || !pendingAction || isWaitingForBlock) return;

    if (isTxConfirmed && txReceipt?.status === 'success') {
      void refetchAll();
      setErrorMessage(null);

      if (pendingAction === 'withdraw') {
        setWithdrawSuccessHash(pendingHash);
      }

      resetPending();
      return;
    }

    if (isTxFailed || txReceipt?.status === 'reverted') {
      setErrorMessage('Transaction failed on-chain. Please try again.');
      resetPending();
    }
  }, [
    pendingHash,
    pendingAction,
    isWaitingForBlock,
    isTxConfirmed,
    isTxFailed,
    txReceipt,
    refetchAll,
    resetPending,
  ]);

  const handleProcessPendingStars = async () => {
    if (isDataLoading || walletFlowActive) return;
    setErrorMessage(null);
    setWithdrawSuccessHash(null);
    try {
      const hash = await writeContractAsync({
        address: contracts.TITAN_PANEL as `0x${string}`,
        abi: PanelABI.abi,
        functionName: 'claimRFTs',
        chainId: CURRENT_NETWORK_INFO.chainId,
      });
      setPendingHash(hash as Address);
      setPendingAction('process');
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Transaction was rejected. Please try again.';
      setErrorMessage(message);
    }
  };

  const handleWithdrawPayout = async () => {
    if (isDataLoading || walletFlowActive || !canClaimWeek) return;
    setErrorMessage(null);
    try {
      const hash = await writeContractAsync({
        address: contracts.TITAN_MANAGER as `0x${string}`,
        abi: ManagerABI.abi,
        functionName: 'claimWeeklySharePayout',
        args: [activeWeekId],
        chainId: CURRENT_NETWORK_INFO.chainId,
      });
      setPendingHash(hash as Address);
      setPendingAction('withdraw');
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Transaction was rejected. Please try again.';
      setErrorMessage(message);
    }
  };

  const actionButtonLabel = useMemo(() => {
    if (!walletFlowActive) return null;
    if (isWaitingForBlock) return 'Confirming...';
    return 'Check your wallet...';
  }, [walletFlowActive, isWaitingForBlock]);

  const explorerTxUrl = withdrawSuccessHash
    ? `${CURRENT_NETWORK_INFO.explorer}/tx/${withdrawSuccessHash}`
    : null;

  return (
    <WalletFlowPageShell title="Reports Stars" titleMedium variant="flat" backTo="/">
      <div className="send-money-page reports-stars-page section">
        {errorMessage ? (
          <div className="reports-stars-surface alert alert-danger mb-3" role="alert">
            {errorMessage}
          </div>
        ) : null}

        {withdrawSuccessHash ? (
          <div className="reports-stars-success-banner">
            Payout confirmed for Week {activeWeekId.toString()}.
            {explorerTxUrl ? (
              <>
                {' '}
                <a href={explorerTxUrl} target="_blank" rel="noopener noreferrer">
                  {formatAddressForDisplay(withdrawSuccessHash, 8, 6)}
                </a>
              </>
            ) : null}
          </div>
        ) : null}

        {/* Section 1 — Live Pending Stars */}
        <section className="reports-stars-section reports-stars-surface">
          <h2 className="reports-stars-section-title">Live Pending Stars</h2>
          <p className="reports-stars-section-desc">
            Pending points are a live on-chain queue — not stored as weekly history. Process them to
            mint RFT stocks.
          </p>

          {isDataLoading ? (
            <div className="reports-stars-loading">
              <Loader />
            </div>
          ) : (
            <div className="card reports-stars-card mb-0">
              <div className="card-body">
                <div className="reports-stars-table-head">
                  <span>Group</span>
                  <span>Stars (L–R)</span>
                  <span>RAW / Paid</span>
                </div>
                {GROUP_IDS.map((groupIdx) => {
                  const points = groupsData[groupIdx];
                  const activation = activationGroups[groupIdx];
                  const isActive = activation?.isActive ?? false;

                  return (
                    <div
                      key={groupIdx}
                      className={`reports-stars-table-row${isActive ? '' : ' reports-stars-table-row--inactive'}`}
                    >
                      <div>
                        <span className="reports-stars-group-name">
                          {getGroupLevelLabel(groupIdx)}
                        </span>
                        {!isActive ? (
                          <>
                            <p className="reports-stars-inactive-msg mb-0">
                              Inactive. You are losing potential income from this group!
                            </p>
                            <Link to="/Activate" className="reports-stars-activate-btn">
                              Activate
                            </Link>
                          </>
                        ) : null}
                      </div>
                      {isActive ? (
                        <>
                          <span className="reports-stars-cell">
                            {formatBigInt(points.pendingLeft)} – {formatBigInt(points.pendingRight)}
                          </span>
                          <span className="reports-stars-cell">
                            {formatBigInt(points.rawLeft)}/{formatBigInt(points.rawRight)}
                            <br />
                            {formatBigInt(points.paidLeft)}/{formatBigInt(points.paidRight)}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="reports-stars-cell">—</span>
                          <span className="reports-stars-cell">—</span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button
            type="button"
            className="btn btn-primary btn-block btn-lg finapp-action-btn reports-stars-action-btn"
            onClick={handleProcessPendingStars}
            disabled={!isConnected || isDataLoading || walletFlowActive}
          >
            {pendingAction === 'process' && actionButtonLabel
              ? actionButtonLabel
              : 'Process Pending Stars'}
          </button>
        </section>

        {/* Section 2 — Weekly RFT Stocks */}
        <section className="reports-stars-section reports-stars-surface">
          <h2 className="reports-stars-section-title">Weekly RFT Stocks</h2>
          <p className="reports-stars-section-desc">
            Historical RFT shares generated per group for the selected week.
          </p>

          <div className="reports-stars-week-nav">
            <button
              type="button"
              className="reports-stars-week-nav-btn"
              aria-label="Previous week"
              disabled={isDataLoading || activeWeekId <= minWeekId}
              onClick={() => setSelectedWeekId((prev) => (prev !== null ? prev - 1n : maxWeekId - 1n))}
            >
              ‹
            </button>
            <span className="reports-stars-week-label">Week {activeWeekId.toString()}</span>
            <button
              type="button"
              className="reports-stars-week-nav-btn"
              aria-label="Next week"
              disabled={isDataLoading || activeWeekId >= maxWeekId}
              onClick={() => setSelectedWeekId((prev) => (prev !== null ? prev + 1n : maxWeekId))}
            >
              ›
            </button>
          </div>

          {isDataLoading ? (
            <div className="reports-stars-loading">
              <Loader />
            </div>
          ) : (
            <div className="card reports-stars-card mb-0">
              <div className="card-body">
                <div className="reports-stars-table-head">
                  <span>Group</span>
                  <span>Stocks (RFT)</span>
                  <span>Est. USD</span>
                </div>
                {GROUP_IDS.map((groupIdx) => {
                  const stock = stocksByGroup[groupIdx]?.shares ?? 0n;
                  return (
                    <div key={groupIdx} className="reports-stars-table-row">
                      <div>
                        <span className="reports-stars-group-name">
                          {getGroupLevelLabel(groupIdx)}
                        </span>
                      </div>
                      <span className="reports-stars-cell reports-stars-cell--bold">
                        {formatBigInt(stock)}
                      </span>
                      <span className="reports-stars-cell">
                        ${formatUsdFromShares(stock, rftPriceUsd)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Section 3 — Withdraw */}
        <section className="reports-stars-section reports-stars-surface">
          <h2 className="reports-stars-section-title">Withdraw Payout</h2>
          <p className="reports-stars-section-desc">
            Claim E1 by burning your weekly RFT shares on Manager.sol for the selected week.
          </p>

          {isDataLoading ? (
            <div className="reports-stars-loading">
              <Loader />
            </div>
          ) : !canClaimWeek ? (
            <p className="reports-stars-empty-msg">
              No pending claims for Week {activeWeekId.toString()}.
            </p>
          ) : (
            <>
              <p className="reports-stars-balance-hero">${totalValueUsd.toFixed(2)}</p>
              <p className="reports-stars-balance-sub">
                {formatBigInt(totalShares)} RFT @ ${rftPriceUsd.toFixed(4)} · Week{' '}
                {activeWeekId.toString()}
              </p>

              <div className="card reports-stars-card mb-0">
                <div className="reports-stars-detail-grid">
                  <div className="reports-stars-detail-row">
                    <span className="send-money-text-regular">RFT Price</span>
                    <span className="send-money-text-regular">${rftPriceUsd.toFixed(4)}</span>
                  </div>
                  <div className="reports-stars-detail-row">
                    <span className="send-money-text-regular">Gross Value</span>
                    <span className="send-money-text-medium">${totalValueUsd.toFixed(2)}</span>
                  </div>
                  <div className="reports-stars-detail-row">
                    <span className="send-money-text-regular">
                      Claim Fee ({claimFeeBps / 100}%)
                    </span>
                    <span className="send-money-text-regular">${feeUsd.toFixed(2)}</span>
                  </div>
                  <div className="reports-stars-detail-row">
                    <span className="send-money-text-medium">You Receive</span>
                    <span className="send-money-text-bold">${netUsd.toFixed(2)} E1</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-block btn-lg finapp-action-btn reports-stars-action-btn"
                onClick={handleWithdrawPayout}
                disabled={!isConnected || walletFlowActive}
              >
                {pendingAction === 'withdraw' && actionButtonLabel
                  ? actionButtonLabel
                  : 'Withdraw Payout'}
              </button>
            </>
          )}
        </section>
      </div>
    </WalletFlowPageShell>
  );
}
