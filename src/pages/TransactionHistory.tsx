import { AppIcon } from '../components/icons/AppIcon';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { FinappPilledTabs } from '../components/ui/FinappPilledTabs';
import { TransactionHistoryList } from '../components/transaction-history/TransactionHistoryList';
import { useTransactionReports } from '../hooks/useTransactionReports';
import {
  TRANSACTION_HISTORY_TABS,
  filterReportsByTab,
  getTransactionHistoryPath,
  getTransactionHistoryTabMeta,
  parseTransactionHistoryTab,
  type TransactionHistoryTabId,
} from '../config/transactionHistoryTabs';
import { TRANSACTION_REPORT_RETENTION_MS } from '../utils/transactionReportStore';
import '../styles/transaction-history-page.css';
import '../styles/transaction-report-page.css';

const RETENTION_MONTHS = Math.round(TRANSACTION_REPORT_RETENTION_MS / (30 * 24 * 60 * 60 * 1000));

export default function TransactionHistory() {
  const navigate = useNavigate();
  const location = useLocation();
  const { address, isConnected } = useAccount();
  const [refreshKey, setRefreshKey] = useState(0);

  const activeTab = useMemo(
    () => parseTransactionHistoryTab(location.search),
    [location.search],
  );

  const allReports = useTransactionReports(address, refreshKey);
  const filteredReports = useMemo(
    () => filterReportsByTab(allReports, activeTab),
    [allReports, activeTab],
  );

  const tabMeta = getTransactionHistoryTabMeta(activeTab);

  const stats = useMemo(() => {
    const success = filteredReports.filter((r) => r.status === 'success').length;
    const pending = filteredReports.filter((r) => r.status === 'pending').length;
    const failed = filteredReports.filter((r) => r.status === 'failed').length;
    return { total: filteredReports.length, success, pending, failed };
  }, [filteredReports]);

  const handleTabChange = (tabId: TransactionHistoryTabId) => {
    navigate(getTransactionHistoryPath(tabId));
  };

  const handleRefresh = () => {
    setRefreshKey((key) => key + 1);
  };

  return (
    <div className="transaction-history-page finapp-secondary-page">
      <div className="appHeader">
        <div className="left">
          <button
            type="button"
            className="headerButton goBack"
            onClick={() => navigate('/')}
            aria-label="Back to dashboard"
          >
            <AppIcon icon="lucide:chevron-left" />
          </button>
        </div>
        <div className="pageTitle">Transactions</div>
        <div className="right">
          <button
            type="button"
            className="headerButton"
            onClick={handleRefresh}
            aria-label="Refresh activity"
          >
            <AppIcon icon="lucide:refresh-cw" />
          </button>
        </div>
      </div>

      <div id="appCapsule" className="full-height">
        <div className="section mt-2 finapp-aligned-block transaction-history-content w-full">
          {!isConnected || !address ? (
            <div className="transaction-history-empty card w-full">
              <AppIcon icon="lucide:wallet" className="transaction-history-empty__icon" />
              <p className="transaction-history-empty__title fw-medium mb-1">Connect your wallet</p>
              <p className="transaction-history-empty__hint fw-normal mb-0">
                Saved transaction reports are stored per wallet on this device.
              </p>
            </div>
          ) : (
            <>
              <div className="card w-full transaction-history-overview mb-2">
                <div className="card-body transaction-history-overview__body">
                  <p className="transaction-history-overview__count fw-bold mb-1">
                    {stats.total} {stats.total === 1 ? 'record' : 'records'}
                  </p>
                  <p className="transaction-history-overview__meta fw-normal mb-0">
                    {stats.success} success · {stats.pending} pending · {stats.failed} failed
                  </p>
                  <p className="transaction-history-overview__retention fw-normal mb-0">
                    On-device history · last {RETENTION_MONTHS} months
                  </p>
                </div>
              </div>

              <FinappPilledTabs
                tabs={TRANSACTION_HISTORY_TABS.map(({ id, label }) => ({ id, label }))}
                activeTab={activeTab}
                onChange={handleTabChange}
                className="transaction-history-tabs-wrap w-full"
                contentClassName="tab-content mt-2"
              >
                {filteredReports.length === 0 ? (
                  <div className="transaction-history-empty card w-full">
                    <AppIcon icon="lucide:history" className="transaction-history-empty__icon" />
                    <p className="transaction-history-empty__title fw-medium mb-1">
                      {tabMeta.emptyTitle}
                    </p>
                    <p className="transaction-history-empty__hint fw-normal mb-0">
                      {tabMeta.emptyHint}
                    </p>
                  </div>
                ) : (
                  <TransactionHistoryList transactions={filteredReports} activeTab={activeTab} />
                )}
              </FinappPilledTabs>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
