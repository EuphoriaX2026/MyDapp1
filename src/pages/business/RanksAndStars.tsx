import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther } from 'viem';
import type { Address } from 'viem';

import { AppIcon } from '../../components/icons/AppIcon';
import { WalletFlowPageShell } from '../../components/wallet/WalletFlowPageShell';
import { Loader } from '../../components/Loader';
import { FinappTransactionReport } from '../../components/FinappTransactionReport';
import { PendingStarsGroupCard } from '../../components/pending-stars/PendingStarsGroupCard';
import { FinappPilledTabs } from '../../components/ui/FinappPilledTabs';
import { usePendingStarsData } from '../../hooks/usePendingStarsData';
import { usePointsMatrix, type GroupPointsData } from '../../hooks/usePointsMatrix';
import { useGroupActivationStatus } from '../../hooks/useGroupActivationStatus';
import { useWeeklyRftStocks } from '../../hooks/useWeeklyRftStocks';
import { useRftIncome } from '../../hooks/useRftIncome';
import { contracts } from '../../config/wagmi';
import { CURRENT_NETWORK_INFO } from '../../config/networks';
import PanelABI from '../../abis/Panel-titan.json';
import { media } from '../../assets/media';
import { getGroupLevelLabel } from '../../data/storeRealmProducts';
import {
  buildPendingStarsClaimReport,
  reportTitle,
} from '../../utils/buildTransactionReportRecord';
import { saveTransactionReport } from '../../utils/transactionReportStore';
import type { TransactionReportRecord } from '../../types/transactionReport';
import { getTransactionHistoryPath } from '../../config/transactionHistoryTabs';
import {
  buildPendingStarsSimulations,
  defaultExpandedGroupCards,
  formatPendingStarsBigInt,
  hasPendingPoints,
  sumMatches,
  sumNewRftShares,
  sumPendingPoints,
  type GroupSimulation,
} from '../../utils/pendingStarsSimulation';
import '../../styles/send-money-page.css';
import '../../styles/checking-credit-page.css';
import '../../styles/pending-stars-page.css';
import '../../styles/reports-stars.css';
import '../../styles/ranks-page.css';
import { BUSINESS_STARS_PATH } from '../../config/businessHubRoutes';

export const RANKS_AND_STARS_PATH = BUSINESS_STARS_PATH;

type HubTabId = 'claim' | 'reports' | 'ranks';
type ClaimFlowStep = 'report' | 'summary' | 'result';

const HUB_TABS: { id: HubTabId; label: string }[] = [
  { id: 'claim', label: 'Claim' },
  { id: 'reports', label: 'Reports' },
  { id: 'ranks', label: 'Ranks' },
];

const CLAIM_INTRO =
  'Check simulated balances before receiving RFT shares on the blockchain.';

const GROUP_IDS = [1, 2, 3, 4, 5, 6, 7] as const;

function formatBigInt(value: bigint) {
  return value.toString();
}

function formatPair(left: bigint, right: bigint) {
  return `${formatBigInt(left)} - ${formatBigInt(right)}`;
}

function hasLedgerData(points: GroupPointsData) {
  return (
    points.rawLeft > 0n ||
    points.rawRight > 0n ||
    points.paidLeft > 0n ||
    points.paidRight > 0n
  );
}

interface ClaimTabProps {
  step: ClaimFlowStep;
  onStepChange: (step: ClaimFlowStep) => void;
}

function ClaimTab({ step, onStepChange }: ClaimTabProps) {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
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
        returnTo: RANKS_AND_STARS_PATH,
      });
      saveTransactionReport(report);
      setResultReport(report);
      setErrorMessage(null);
      onStepChange('result');
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
        returnTo: RANKS_AND_STARS_PATH,
      });
      saveTransactionReport(report);
      setResultReport(report);
      setErrorMessage('Transaction failed on-chain. Please try again.');
      onStepChange('result');
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
    onStepChange,
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
          returnTo: RANKS_AND_STARS_PATH,
        });
        setResultReport(report);
        onStepChange('result');
      }
    }
  };

  const walletFlowActive = isPending || isWaitingForBlock;
  const canProceedToSummary = claimSimulations.length > 0;

  const receiveButtonLabel = useMemo(() => {
    if (isWaitingForBlock) return 'Confirming...';
    if (isPending) return 'Check your wallet...';
    return 'Receive RFT Shares';
  }, [isWaitingForBlock, isPending]);

  return (
    <div className="pending-stars-page">
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
            <p className="pending-stars-intro reports-stars-section-desc">{CLAIM_INTRO}</p>

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
                      onClick={() => onStepChange('summary')}
                      disabled={!isConnected || !canProceedToSummary}
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      className="pending-stars-cancel-btn"
                      onClick={() => navigate('/')}
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
            hash={
              resultReport.hash.startsWith('0x') && resultReport.hash.length === 66
                ? resultReport.hash
                : undefined
            }
            errorMessage={errorMessage ?? undefined}
            footer={
              <div className="pending-stars-result-actions">
                <Link
                  to={getTransactionHistoryPath('stars')}
                  className="btn btn-text-secondary btn-block pending-stars-history-link"
                >
                  View activity history
                </Link>
                {resultReport.status === 'success' &&
                resultReport.hash.startsWith('0x') &&
                resultReport.hash.length === 66 ? (
                  <Link
                    to={`/transaction/${resultReport.hash}`}
                    state={{ ...resultReport, returnTo: RANKS_AND_STARS_PATH }}
                    className="btn btn-text-secondary btn-block pending-stars-history-link"
                  >
                    Open transaction details
                  </Link>
                ) : null}
                <button
                  type="button"
                  className="btn btn-primary btn-block btn-lg finapp-action-btn pending-stars-action-btn"
                  onClick={() => onStepChange('report')}
                >
                  Done
                </button>
              </div>
            }
          />
        </div>
      ) : null}
    </div>
  );
}

function ReportsTab() {
  const { isConnected } = useAccount();
  const [selectedWeekId, setSelectedWeekId] = useState<bigint | null>(null);

  const { groupsData, isLoading: isPointsLoading } = usePointsMatrix();
  const { groups: activationGroups, isLoading: isActivationLoading } =
    useGroupActivationStatus();
  const {
    minSelectableWeekId,
    maxSelectableWeekId,
    isLoading: isWeekLoading,
  } = useRftIncome();

  const minWeekId = minSelectableWeekId;
  const maxWeekId = maxSelectableWeekId;
  const activeWeekId = selectedWeekId ?? maxWeekId;

  const { stocksByGroup, totalShares, isLoading: isStocksLoading } =
    useWeeklyRftStocks(activeWeekId);

  useEffect(() => {
    if (!isWeekLoading && selectedWeekId === null) {
      setSelectedWeekId(maxWeekId >= minWeekId ? maxWeekId : minWeekId);
    }
  }, [isWeekLoading, maxWeekId, minWeekId, selectedWeekId]);

  const isDataLoading =
    isPointsLoading ||
    isActivationLoading ||
    isWeekLoading ||
    isStocksLoading ||
    selectedWeekId === null;

  const visibleLedgerGroups = useMemo(
    () =>
      GROUP_IDS.filter((groupIdx) => {
        const isActive = activationGroups[groupIdx]?.isActive ?? false;
        return isActive || hasLedgerData(groupsData[groupIdx]);
      }),
    [activationGroups, groupsData],
  );

  const visibleStockGroups = useMemo(
    () =>
      GROUP_IDS.filter((groupIdx) => {
        const isActive = activationGroups[groupIdx]?.isActive ?? false;
        const shares = stocksByGroup[groupIdx]?.shares ?? 0n;
        return isActive || shares > 0n;
      }),
    [activationGroups, stocksByGroup],
  );

  return (
    <div className="reports-stars-analytics-page">
      <div className="reports-stars-analytics-surface reports-stars-analytics-hero">
        <h1 className="reports-stars-analytics-hero-title">Reports Stars</h1>
        <p className="reports-stars-analytics-hero-sub">
          Read-only analytics — cumulative RAW &amp; Paid ledgers and weekly RFT stock history.
        </p>
      </div>

      <section className="reports-stars-analytics-surface reports-stars-analytics-section">
        <h2 className="reports-stars-analytics-section-title">Points Ledger (RAW &amp; Paid)</h2>
        <p className="reports-stars-analytics-section-subtitle">
          Global cumulative state from userPointLedgers
        </p>

        {isDataLoading ? (
          <div className="reports-stars-analytics-loading">
            <Loader />
          </div>
        ) : !isConnected ? (
          <div className="reports-stars-analytics-card">
            <p className="reports-stars-analytics-empty">
              Connect your wallet to view point ledger data.
            </p>
          </div>
        ) : visibleLedgerGroups.length === 0 ? (
          <div className="reports-stars-analytics-card">
            <p className="reports-stars-analytics-empty">
              No active groups or ledger data found.
            </p>
          </div>
        ) : (
          <div className="reports-stars-analytics-card">
            <div className="reports-stars-analytics-table-head reports-stars-analytics-table-head--ledger">
              <span>Realm</span>
              <span>RAW (L - R)</span>
              <span>Paid (L - R)</span>
            </div>
            {visibleLedgerGroups.map((groupIdx) => {
              const points = groupsData[groupIdx];
              return (
                <div
                  key={groupIdx}
                  className="reports-stars-analytics-table-row reports-stars-analytics-table-row--ledger"
                >
                  <span className="reports-stars-analytics-realm">
                    {getGroupLevelLabel(groupIdx)}
                  </span>
                  <span className="reports-stars-analytics-value">
                    {formatPair(points.rawLeft, points.rawRight)}
                  </span>
                  <span className="reports-stars-analytics-value">
                    {formatPair(points.paidLeft, points.paidRight)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="reports-stars-analytics-surface reports-stars-analytics-section">
        <h2 className="reports-stars-analytics-section-title">Weekly RFT Stocks History</h2>
        <p className="reports-stars-analytics-section-subtitle">
          userSharesInWeekByGroup per selected week
        </p>

        <div className="reports-stars-analytics-week-nav">
          <button
            type="button"
            className="reports-stars-analytics-week-btn"
            aria-label="Previous week"
            disabled={isDataLoading || activeWeekId <= minWeekId}
            onClick={() =>
              setSelectedWeekId((prev) => (prev !== null ? prev - 1n : maxWeekId - 1n))
            }
          >
            &lt; Previous
          </button>
          <span className="reports-stars-analytics-week-label">
            Week {activeWeekId.toString()}
          </span>
          <button
            type="button"
            className="reports-stars-analytics-week-btn"
            aria-label="Next week"
            disabled={isDataLoading || activeWeekId >= maxWeekId}
            onClick={() =>
              setSelectedWeekId((prev) => (prev !== null ? prev + 1n : maxWeekId))
            }
          >
            Next &gt;
          </button>
        </div>

        {isDataLoading ? (
          <div className="reports-stars-analytics-loading">
            <Loader />
          </div>
        ) : !isConnected ? (
          <div className="reports-stars-analytics-card">
            <p className="reports-stars-analytics-empty">
              Connect your wallet to view weekly RFT stock history.
            </p>
          </div>
        ) : visibleStockGroups.length === 0 ? (
          <div className="reports-stars-analytics-card">
            <p className="reports-stars-analytics-empty">
              No RFT shares recorded for Week {activeWeekId.toString()}.
            </p>
          </div>
        ) : (
          <div className="reports-stars-analytics-card">
            <div className="reports-stars-analytics-table-head reports-stars-analytics-table-head--stocks">
              <span>Realm</span>
              <span>RFT Shares</span>
            </div>
            {visibleStockGroups.map((groupIdx) => {
              const shares = stocksByGroup[groupIdx]?.shares ?? 0n;
              return (
                <div
                  key={groupIdx}
                  className="reports-stars-analytics-table-row reports-stars-analytics-table-row--stocks"
                >
                  <span className="reports-stars-analytics-realm">
                    {getGroupLevelLabel(groupIdx)}
                  </span>
                  <span className="reports-stars-analytics-value reports-stars-analytics-value--bold">
                    {formatBigInt(shares)}
                  </span>
                </div>
              );
            })}
            <div className="reports-stars-analytics-total-row">
              <span className="reports-stars-analytics-total-label">Total Shares</span>
              <span className="reports-stars-analytics-total-value">
                {formatBigInt(totalShares)}
              </span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function RanksTab() {
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [timeLeft, setTimeLeft] = useState({
    days: 365,
    hours: 10,
    minutes: 21,
    seconds: 7,
  });

  const multipliers = [1, 3, 5, 10, 30, 50, 100];
  const characterImage =
    'https://cdn.pixabay.com/photo/2021/08/11/11/15/woman-6538202_1280.png';

  const levels = Array.from({ length: 7 }, (_, i) => ({
    level: i + 1,
    isUnlocked: i === 0,
    boosters: 0,
    maxStars: 5,
    gemsCount: 0.0,
    powerMultiplier: `${multipliers[i]}x`,
    e1Tokens: (i + 1) * 10,
    remainingDays: 365,
  }));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              hours = 23;
              if (days > 0) days--;
            }
          }
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const currentBannerImage = selectedLevel === 1 ? media.ranks.bannerLevel1 : characterImage;
  const selectedLevelData = levels.find((l) => l.level === selectedLevel) || levels[0];
  const activeHeaderStars = selectedLevelData.isUnlocked ? 1 + selectedLevelData.boosters : 0;

  const timerUnits = [
    {
      value:
        timeLeft.days >= 1000
          ? `${Math.floor(timeLeft.days / 1000)}k`
          : String(timeLeft.days).padStart(2, '0'),
      label: 'DAYS',
    },
    { value: String(timeLeft.hours).padStart(2, '0'), label: 'HOURS' },
    { value: String(timeLeft.minutes).padStart(2, '0'), label: 'MIN' },
    { value: String(timeLeft.seconds).padStart(2, '0'), label: 'SEC' },
  ];

  return (
    <div className="ranks-page finapp-aligned-block">
      <div className="ranks-hero-card">
        <div className="ranks-hero-card__inner">
          <div>
            <div className="ranks-hero-card__stars">
              {Array.from({ length: selectedLevelData.maxStars }).map((_, i) => (
                <AppIcon
                  icon="lucide:star"
                  key={i}
                  size={14}
                  className={
                    i < activeHeaderStars ? 'fill-[#ffb400] text-[#ffb400]' : 'text-white/35'
                  }
                />
              ))}
            </div>

            <h1 className="ranks-hero-card__title">{selectedLevel} Level</h1>

            <div className="ranks-hero-card__stats">
              <div className="ranks-hero-card__stat">
                <img src={media.logos.my} alt="E1" />
                <span>${selectedLevelData.e1Tokens}</span>
              </div>
              <div className="ranks-hero-card__stat">
                <img src={media.ranks.flashGold} alt="Power" />
                <span>{selectedLevelData.powerMultiplier}</span>
              </div>
            </div>

            <div className="ranks-hero-card__segments">
              {[1, 2, 3].map((i) => (
                <div
                  key={`filled-${i}`}
                  className="ranks-hero-card__segment ranks-hero-card__segment--active"
                />
              ))}
              {[4, 5, 6].map((i) => (
                <div key={`empty-${i}`} className="ranks-hero-card__segment" />
              ))}
            </div>
          </div>
        </div>

        <div className="ranks-hero-card__character">
          <img
            key={currentBannerImage}
            src={currentBannerImage}
            alt={`Level ${selectedLevel}`}
            className="ranks-hero-fade-in"
          />
        </div>
      </div>

      <div className="ranks-hero-actions">
        <div className="ranks-hero-timer">
          {timerUnits.map((time) => (
            <div key={time.label} className="ranks-hero-timer__unit">
              <span className="ranks-hero-timer__value">{time.value}</span>
              <span className="ranks-hero-timer__label">{time.label}</span>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="btn btn-primary btn-lg btn-block finapp-action-btn ranks-hero-upgrade"
          onClick={() => {
            console.log(`Upgrade Level ${selectedLevel}`);
          }}
        >
          Upgrade
        </button>
      </div>

      <svg width="0" height="0" aria-hidden className="ranks-level-defs">
        <defs>
          <linearGradient id="ranks-grad-selected" x1="10%" y1="0%" x2="0%" y2="100%">
            <stop offset="8%" stopColor="#7b5cff" stopOpacity="1" />
            <stop offset="45%" stopColor="#6236ff" />
            <stop offset="100%" stopColor="#2a1566" />
          </linearGradient>
          <linearGradient id="ranks-grad-normal" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--ranks-shield-top, #ffffff)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--ranks-shield-bottom, #ededf5)" stopOpacity="0.98" />
          </linearGradient>
        </defs>
      </svg>

      <div className="ranks-level-grid">
        {levels.map((lvl) => {
          const isSelected = selectedLevel === lvl.level;
          const activeCardStars = lvl.isUnlocked ? 1 + lvl.boosters : 0;

          return (
            <div
              key={lvl.level}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedLevel(lvl.level)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedLevel(lvl.level);
                }
              }}
              className={`ranks-level-card${isSelected ? ' ranks-level-card--selected' : ''}`}
            >
              <svg
                viewBox="0 0 100 120"
                preserveAspectRatio="none"
                className="ranks-level-card__shield"
                aria-hidden
              >
                <path
                  d="M 50 5
                     C 75 8, 95 15, 95 20
                     L 95 75
                     C 95 95, 70 110, 50 113
                     C 30 110, 5 95, 5 75
                     L 5 20
                     C 5 15, 25 8, 50 5 Z"
                  fill={isSelected ? 'url(#ranks-grad-selected)' : 'url(#ranks-grad-normal)'}
                  stroke={isSelected ? '#6236ff' : 'var(--ranks-shield-stroke, #dcdce9)'}
                  strokeWidth={isSelected ? '0.9' : '0.5'}
                />
              </svg>

              <div className="ranks-level-card__content">
                <h2 className="ranks-level-card__title">{lvl.level} Level</h2>

                <div className="ranks-level-card__stars">
                  {Array.from({ length: lvl.maxStars }).map((_, i) => (
                    <AppIcon
                      icon="lucide:star"
                      key={i}
                      size={16}
                      className={
                        i < activeCardStars
                          ? 'fill-[#ffb400] text-[#ffb400]'
                          : isSelected
                            ? 'text-transparent stroke-white/35 stroke-[1.5]'
                            : 'text-transparent stroke-[#c4bdd4] stroke-[1.5]'
                      }
                    />
                  ))}
                </div>

                <div className="ranks-level-card__rows">
                  <div className="ranks-level-card__row">
                    <div className="ranks-level-card__row-label">
                      <img src={media.ranks.diamondRed} alt="" />
                      <span>GEM</span>
                    </div>
                    <span className="ranks-level-card__row-value">{lvl.gemsCount.toFixed(1)}</span>
                  </div>

                  <div className="ranks-level-card__row">
                    <div className="ranks-level-card__row-label">
                      <img src={media.ranks.flashGold} alt="" />
                      <span>Power</span>
                    </div>
                    <span className="ranks-level-card__row-value">{lvl.powerMultiplier}</span>
                  </div>

                  <div className="ranks-level-card__row">
                    <div className="ranks-level-card__row-label">
                      <img src={media.logos.my} alt="" />
                      <span>Value</span>
                    </div>
                    <span className="ranks-level-card__row-value">${lvl.e1Tokens}</span>
                  </div>
                </div>

                <div className="ranks-level-card__days">
                  <span className="ranks-level-card__days-value">{lvl.remainingDays}</span>
                  <span className="ranks-level-card__days-label">DAY</span>
                </div>
              </div>

              <div className="ranks-level-card__badge">
                {lvl.isUnlocked ? (
                  <div className="ranks-level-card__badge-inner ranks-level-card__badge-inner--ok">
                    <AppIcon icon="lucide:check" size={18} className="text-white" strokeWidth={3} />
                  </div>
                ) : (
                  <div className="ranks-level-card__badge-inner ranks-level-card__badge-inner--lock">
                    <AppIcon icon="lucide:lock" size={14} className="text-[#958d9e]" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Business Hub — pending stars claim, analytics reports, and rank progression. */
export default function RanksAndStars() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<HubTabId>('claim');
  const [claimStep, setClaimStep] = useState<ClaimFlowStep>('report');

  const handleClaimBack = () => {
    if (claimStep === 'result') {
      setClaimStep('summary');
      return;
    }
    if (claimStep === 'summary') {
      setClaimStep('report');
    }
  };

  const shellTitle =
    activeTab === 'claim' && claimStep === 'summary'
      ? 'Shares Summary'
      : activeTab === 'claim' && claimStep === 'result'
        ? ''
        : 'Ranks & Stars';

  const hideTitle = activeTab === 'claim' && (claimStep === 'report' || claimStep === 'result');

  const headerRight =
    activeTab === 'claim' && claimStep === 'report' ? (
      <button
        type="button"
        className="headerButton"
        onClick={() => navigate(getTransactionHistoryPath('stars'))}
        aria-label="Pending stars history"
      >
        <AppIcon icon="lucide:history" />
      </button>
    ) : null;

  const showTabs = activeTab !== 'claim' || claimStep === 'report';

  return (
    <WalletFlowPageShell
      title={shellTitle}
      titleMedium
      variant="flat"
      backTo="/"
      hideTitle={hideTitle}
      headerRight={headerRight}
      onBack={
        activeTab === 'claim' && claimStep !== 'report' ? handleClaimBack : undefined
      }
    >
      <div className="send-money-page section finapp-aligned-block">
        {showTabs ? (
          <FinappPilledTabs
            tabs={HUB_TABS}
            activeTab={activeTab}
            onChange={(tab) => {
              setActiveTab(tab);
              if (tab === 'claim') {
                setClaimStep('report');
              }
            }}
            contentClassName="tab-content mt-2"
          >
            {activeTab === 'claim' ? (
              <ClaimTab step={claimStep} onStepChange={setClaimStep} />
            ) : null}
            {activeTab === 'reports' ? <ReportsTab /> : null}
            {activeTab === 'ranks' ? <RanksTab /> : null}
          </FinappPilledTabs>
        ) : (
          <ClaimTab step={claimStep} onStepChange={setClaimStep} />
        )}
      </div>
    </WalletFlowPageShell>
  );
}
