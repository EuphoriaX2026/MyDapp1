import { useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';

import { WalletFlowPageShell } from '../components/wallet/WalletFlowPageShell';
import { Loader } from '../components/Loader';
import { usePointsMatrix, type GroupPointsData } from '../hooks/usePointsMatrix';
import { useGroupActivationStatus } from '../hooks/useGroupActivationStatus';
import { useWeeklyRftStocks } from '../hooks/useWeeklyRftStocks';
import { useRftIncome } from '../hooks/useRftIncome';
import { getGroupLevelLabel } from '../data/storeRealmProducts';
import '../styles/send-money-page.css';
import '../styles/reports-stars.css';

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

export default function ReportsStars() {
  const { isConnected } = useAccount();
  const [selectedWeekId, setSelectedWeekId] = useState<bigint | null>(null);

  const { groupsData, isLoading: isPointsLoading } = usePointsMatrix();
  const { groups: activationGroups, isLoading: isActivationLoading } =
    useGroupActivationStatus();
  const {
    currentWeekId,
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
    <WalletFlowPageShell
      title="Reports Stars"
      titleMedium
      variant="flat"
      backTo="/MyWallet"
    >
      <div className="send-money-page reports-stars-analytics-page section">
        <div className="reports-stars-analytics-surface reports-stars-analytics-hero">
          <h1 className="reports-stars-analytics-hero-title">Reports Stars</h1>
          <p className="reports-stars-analytics-hero-sub">
            Read-only analytics — cumulative RAW &amp; Paid ledgers and weekly RFT stock
            history.
          </p>
        </div>

        {/* Section 1 — Global Points Status */}
        <section className="reports-stars-analytics-surface reports-stars-analytics-section">
          <h2 className="reports-stars-analytics-section-title">
            Points Ledger (RAW &amp; Paid)
          </h2>
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

        {/* Section 2 — Weekly RFT Stocks History */}
        <section className="reports-stars-analytics-surface reports-stars-analytics-section">
          <h2 className="reports-stars-analytics-section-title">
            Weekly RFT Stocks History
          </h2>
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
                setSelectedWeekId((prev) =>
                  prev !== null ? prev - 1n : maxWeekId - 1n,
                )
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
                setSelectedWeekId((prev) =>
                  prev !== null ? prev + 1n : maxWeekId,
                )
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
    </WalletFlowPageShell>
  );
}
