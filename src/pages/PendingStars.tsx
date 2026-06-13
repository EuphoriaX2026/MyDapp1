import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther } from 'viem';
import type { Address } from 'viem';

import { AppIcon } from '../components/icons/AppIcon';
import { WalletFlowPageShell } from '../components/wallet/WalletFlowPageShell';
import { Loader } from '../components/Loader';
import { FinappTransactionReport } from '../components/FinappTransactionReport';
import { PendingStarsGroupCard } from '../components/pending-stars/PendingStarsGroupCard';
import { usePendingStarsData } from '../hooks/usePendingStarsData';
import { contracts } from '../config/wagmi';
import PanelABI from '../abis/Panel-titan.json';
import {
  buildPendingStarsClaimReport,
  reportTitle,
} from '../utils/buildTransactionReportRecord';
import { saveTransactionReport } from '../utils/transactionReportStore';
import type { TransactionReportRecord } from '../types/transactionReport';
import { getTransactionHistoryPath } from '../config/transactionHistoryTabs';
import {
  buildPendingStarsSimulations,
  defaultExpandedGroupCards,
  formatPendingStarsBigInt,
  hasPendingPoints,
  sumMatches,
  sumNewRftShares,
  sumPendingPoints,
  type GroupSimulation,
} from '../utils/pendingStarsSimulation';
import '../styles/send-money-page.css';
import '../styles/checking-credit-page.css';
import '../styles/pending-stars-page.css';

type FlowStep = 'report' | 'summary' | 'result';

const INTRO_TEXT =
  'Check simulated balances before receiving RFT shares on the blockchain.';

/** Full simulation + claim flow — linked from sidebar. */
export default function PendingStars() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const [step, setStep] = useState<FlowStep>('report');
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingHash, setPendingHash] = useState<Address | undefined>();
  const [resultReport, setResultReport] = useState<TransactionReportRecord | null>(null);

  const {
    groupsData,
    activationGroups,
    multipliersByGroup,
    isDataLoading,
    activeGroups,
    inactiveGroups,
    activeGroupsWithPending,
    refetchPoints,
    refetchActivation,
  } = usePendingStarsData();

  const displayGroupIds = useMemo(() => {
    const inactiveWithPending = inactiveGroups.filter((groupIdx) =>
      hasPendingPoints(groupsData[groupIdx]),
    );
    return [...activeGroups, ...inactiveWithPending].sort((a, b) => a - b);
  }, [activeGroups, inactiveGroups, groupsData]);

  const reportSimulations = useMemo(
    () => buildPendingStarsSimulations(displayGroupIds, groupsData, multipliersByGroup),
    [displayGroupIds, groupsData, multipliersByGroup],
  );

  const claimSimulations = useMemo(
    () => buildPendingStarsSimulations(activeGroupsWithPending, groupsData, multipliersByGroup),
    [activeGroupsWithPending, groupsData, multipliersByGroup],
  );

  const simulationsByGroupIdx = useMemo(() => {
    const map = new Map<number, GroupSimulation>();
    reportSimulations.forEach((sim) => map.set(sim.groupIdx, sim));
    return map;
  }, [reportSimulations]);

  const grandTotalRft = useMemo(() => sumNewRftShares(claimSimulations), [claimSimulations]);
  const totalPoints = useMemo(() => sumPendingPoints(claimSimulations), [claimSimulations]);
  const totalMatches = useMemo(() => sumMatches(claimSimulations), [claimSimulations]);

  const { isPending, writeContractAsync } = useWriteContract();
  const {
    isLoading: isWaitingForBlock,
    isSuccess: isTxConfirmed,
    isError: isTxFailed,
    data: txReceipt,
  } = useWaitForTransactionReceipt({ hash: pendingHash });

  const resetPendingTx = useCallback(() => {
    setPendingHash(undefined);
  }, []);

  const expandedInitializedRef = useRef(false);

  useEffect(() => {
    if (isDataLoading || displayGroupIds.length === 0 || expandedInitializedRef.current) return;
    setExpandedCards(defaultExpandedGroupCards(displayGroupIds));
    expandedInitializedRef.current = true;
  }, [isDataLoading, displayGroupIds]);

  useEffect(() => {
    if (!pendingHash || isWaitingForBlock) return;

    if (isTxConfirmed && txReceipt?.status === 'success' && address) {
      void Promise.all([refetchPoints(), refetchActivation()]);
      const gasPaidPol =
        txReceipt.gasUsed && txReceipt.effectiveGasPrice
          ? formatEther(txReceipt.gasUsed * txReceipt.effectiveGasPrice)
          : undefined;
      const report = buildPendingStarsClaimReport({
        hash: pendingHash,
        status: 'success',
        walletAddress: address,
        totalRftShares: grandTotalRft,
        totalPoints,
        blockNumber: Number(txReceipt.blockNumber),
        gasPaidPol,
        returnTo: '/pending-stars',
      });
      saveTransactionReport(report);
      setResultReport(report);
      setErrorMessage(null);
      setStep('result');
      resetPendingTx();
      return;
    }

    if ((isTxFailed || txReceipt?.status === 'reverted') && address && pendingHash) {
      const report = buildPendingStarsClaimReport({
        hash: pendingHash,
        status: 'failed',
        walletAddress: address,
        totalRftShares: grandTotalRft,
        totalPoints,
        returnTo: '/pending-stars',
      });
      saveTransactionReport(report);
      setResultReport(report);
      setErrorMessage('Transaction failed on-chain. Please try again.');
      setStep('result');
      resetPendingTx();
    }
  }, [
    pendingHash,
    isWaitingForBlock,
    isTxConfirmed,
    isTxFailed,
    txReceipt,
    grandTotalRft,
    totalPoints,
    address,
    refetchPoints,
    refetchActivation,
    resetPendingTx,
  ]);

  const isInactiveWarning = useCallback(
    (groupIdx: number) => !(activationGroups[groupIdx]?.isActive ?? false),
    [activationGroups],
  );

  const handleReceiveRft = async () => {
    if (claimSimulations.length === 0 || isPending || isWaitingForBlock) return;
    setErrorMessage(null);

    try {
      const hash = await writeContractAsync({
        address: contracts.TITAN_PANEL as `0x${string}`,
        abi: PanelABI.abi,
        functionName: 'claimRFTs',
        chainId: CURRENT_NETWORK_INFO.chainId,
      });
      setPendingHash(hash as Address);
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Transaction was rejected. Please try again.';
      setErrorMessage(message);
      if (address) {
        const report = buildPendingStarsClaimReport({
          hash: `0x${Date.now().toString(16)}` as `0x${string}`,
          status: 'failed',
          walletAddress: address,
          totalRftShares: grandTotalRft,
          totalPoints,
          returnTo: '/pending-stars',
        });
        setResultReport(report);
        setStep('result');
      }
    }
  };

  const handleBack = () => {
    if (step === 'result') {
      setStep('summary');
      return;
    }
    if (step === 'summary') {
      setStep('report');
    }
  };

  const walletFlowActive = isPending || isWaitingForBlock;

  const receiveButtonLabel = useMemo(() => {
    if (isWaitingForBlock) return 'Confirming...';
    if (isPending) return 'Check your wallet...';
    return 'Receive RFT Shares';
  }, [isWaitingForBlock, isPending]);

  const shellTitle = step === 'summary' ? 'Shares Summary' : step === 'result' ? '' : '';

  const canProceedToSummary = claimSimulations.length > 0;

  const historyHeaderButton =
    step === 'report' ? (
      <button
        type="button"
        className="headerButton"
        onClick={() => navigate(getTransactionHistoryPath('stars'))}
        aria-label="Pending stars history"
      >
        <AppIcon icon="lucide:history" />
      </button>
    ) : null;

  return (
    <WalletFlowPageShell
      title={shellTitle}
      titleMedium
      variant="flat"
      backTo="/MyWallet"
      hideTitle={step === 'report' || step === 'result'}
      headerRight={historyHeaderButton}
      onBack={step !== 'report' ? handleBack : undefined}
    >
      <div className="send-money-page pending-stars-page section">
        {errorMessage ? (
          <div className="pending-stars-error" role="alert">
            {errorMessage}
          </div>
        ) : null}

        {step === 'report' ? (
          <>
            <div className="pending-stars-page-hero">
              <h1 className="pending-stars-header-title">Pending Stars</h1>
            </div>
            <div className="pending-stars-surface">
              <p className="pending-stars-intro reports-stars-section-desc">{INTRO_TEXT}</p>

            {isDataLoading ? (
              <div className="pending-stars-loading">
                <Loader />
              </div>
            ) : displayGroupIds.length === 0 ? (
              <p className="reports-stars-empty-msg">
                No active groups. Activate a realm to start earning pending stars.
              </p>
            ) : (
              <>
                <div className="pending-stars-group-list">
                  {displayGroupIds.map((groupIdx) => {
                    const sim = simulationsByGroupIdx.get(groupIdx);
                    if (!sim) return null;
                    return (
                      <PendingStarsGroupCard
                        key={groupIdx}
                        sim={sim}
                        isOpen={expandedCards[groupIdx] ?? false}
                        isInactiveWarning={isInactiveWarning(groupIdx)}
                        onToggle={() =>
                          setExpandedCards((prev) => ({
                            ...prev,
                            [groupIdx]: !prev[groupIdx],
                          }))
                        }
                      />
                    );
                  })}
                </div>

                <div className="pending-stars-confirm-block">
                  <p className="pending-stars-confirm-prompt">
                    Do you intend to receive your points and shares?
                  </p>
                  <div className="pending-stars-confirm-actions">
                    <button
                      type="button"
                      className="btn btn-primary btn-block btn-lg finapp-action-btn pending-stars-action-btn"
                      onClick={() => setStep('summary')}
                      disabled={!isConnected || !canProceedToSummary}
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      className="pending-stars-cancel-btn"
                      onClick={() => navigate('/MyWallet')}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </>
            )}
            </div>
          </>
        ) : null}

        {step === 'summary' ? (
          <div className="pending-stars-surface">
            <h1 className="pending-stars-header-title">Generated Shares Summary</h1>
            <p className="pending-stars-intro reports-stars-section-desc">
              Review pending and generated RFT shares before confirming on-chain.
            </p>

            {claimSimulations.length === 0 ? (
              <p className="reports-stars-empty-msg">No claimable pending stars found.</p>
            ) : (
              <>
                <div className="pending-stars-step2-table card reports-stars-card mb-0">
                  <div className="card-body" style={{ padding: '12px 14px' }}>
                    <div className="pending-stars-step2-table-head">
                      <span>Group</span>
                      <span>RFT Shares</span>
                    </div>
                    {claimSimulations.map((sim) => (
                      <div key={sim.groupIdx} className="pending-stars-step2-table-row">
                        <span className="pending-stars-group-name">{sim.groupName}</span>
                        <span className="pending-stars-cell pending-stars-cell--bold">
                          {formatPendingStarsBigInt(sim.newRftShares)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pending-stars-step2-totals">
                  <div className="pending-stars-step2-total-row">
                    <span>Total Points</span>
                    <strong>{formatPendingStarsBigInt(totalPoints)}</strong>
                  </div>
                  <div className="pending-stars-step2-total-row">
                    <span>Total Received Shares</span>
                    <strong>{formatPendingStarsBigInt(totalMatches)}</strong>
                  </div>
                  <div className="pending-stars-step2-total-row pending-stars-step2-total-row--highlight">
                    <span>Your Shares After Changes</span>
                    <strong>{formatPendingStarsBigInt(grandTotalRft)}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-primary btn-block btn-lg finapp-action-btn pending-stars-action-btn pending-stars-step2-action"
                  onClick={handleReceiveRft}
                  disabled={!isConnected || walletFlowActive}
                >
                  {receiveButtonLabel}
                </button>
              </>
            )}
          </div>
        ) : null}

        {step === 'result' && resultReport ? (
          <div className="pending-stars-surface">
            <FinappTransactionReport
              embedded
              title={reportTitle(resultReport.status, resultReport.kind)}
              status={resultReport.status}
              kind={resultReport.kind}
              source={resultReport.source}
              fields={resultReport.fields}
              hash={resultReport.hash.startsWith('0x') && resultReport.hash.length === 66 ? resultReport.hash : undefined}
              errorMessage={errorMessage ?? undefined}
              footer={
                <div className="pending-stars-result-actions">
                  <Link
                    to={getTransactionHistoryPath('stars')}
                    className="btn btn-text-secondary btn-block pending-stars-history-link"
                  >
                    View activity history
                  </Link>
                  {resultReport.status === 'success' && resultReport.hash.startsWith('0x') && resultReport.hash.length === 66 ? (
                    <Link
                      to={`/transaction/${resultReport.hash}`}
                      state={{ ...resultReport, returnTo: '/pending-stars' }}
                      className="btn btn-text-secondary btn-block pending-stars-history-link"
                    >
                      Open transaction details
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    className="btn btn-primary btn-block btn-lg finapp-action-btn pending-stars-action-btn"
                    onClick={() => navigate('/pending-stars')}
                  >
                    Done
                  </button>
                </div>
              }
            />
          </div>
        ) : null}
      </div>
    </WalletFlowPageShell>
  );
}
