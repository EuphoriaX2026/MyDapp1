import { AppIcon } from './icons/AppIcon';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther } from 'viem';
import type { TransactionReportRouteState } from '../types/transactionReport';
import {
  findTransactionReportByHash,
  getTransactionReport,
  saveTransactionReport,
  updateTransactionReport,
} from '../utils/transactionReportStore';
import {
  legacyEdexToReport,
  patchReportFromReceipt,
  reportTitle,
} from '../utils/buildTransactionReportRecord';
import { FinappTransactionReport } from './FinappTransactionReport';
import {
  getTransactionReportHistoryPath,
  getTransactionReportHistoryPathFromRecord,
  getTransactionReportSectionHome,
} from '../utils/transactionReportNavigation';
import '../styles/transaction-report-page.css';

export function TransactionReport() {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { address: connectedAddress } = useAccount();

  const [routeState] = useState<TransactionReportRouteState>(location.state || {});
  const wallet = routeState.walletAddress ?? connectedAddress ?? '';

  const baseReport = useMemo(() => {
    if (!transactionId) return null;

    const stored = wallet
      ? getTransactionReport(wallet, transactionId)
      : findTransactionReportByHash(transactionId);

    if (stored) {
      return { ...stored, returnTo: routeState.returnTo ?? stored.returnTo };
    }

    return legacyEdexToReport(routeState, transactionId, wallet);
  }, [wallet, transactionId, routeState]);

  const reportSource = baseReport?.source ?? routeState.source;
  const storedReturnTo = routeState.returnTo ?? baseReport?.returnTo;

  const historyPath = baseReport
    ? getTransactionReportHistoryPathFromRecord(baseReport)
    : getTransactionReportHistoryPath(reportSource, routeState.kind);
  const sectionHomePath = getTransactionReportSectionHome(reportSource, storedReturnTo);

  const handleBack = () => {
    navigate(historyPath);
  };

  const handleClose = () => {
    navigate(sectionHomePath);
  };

  const { data: receipt, isLoading, isError } = useWaitForTransactionReceipt({
    hash: transactionId as `0x${string}`,
    pollingInterval: 2_000,
  });

  const status = useMemo(() => {
    if (isLoading) return 'pending' as const;
    if (isError) return 'failed' as const;
    if (receipt?.status === 'success') return 'success' as const;
    if (receipt?.status === 'reverted') return 'failed' as const;
    return baseReport?.status ?? ('pending' as const);
  }, [isLoading, isError, receipt, baseReport?.status]);

  const report = useMemo(() => {
    if (!baseReport) return null;

    const gasPaidPol =
      receipt && receipt.gasUsed && receipt.effectiveGasPrice
        ? formatEther(receipt.gasUsed * receipt.effectiveGasPrice)
        : undefined;

    let createdAt = baseReport.createdAt;
    if (receipt?.blockNumber && receipt.blockNumber) {
      // keep existing createdAt unless we only have "now"
    }

    return patchReportFromReceipt(baseReport, status, {
      blockNumber: receipt ? Number(receipt.blockNumber) : baseReport.blockNumber,
      gasPaidPol,
      createdAt,
    });
  }, [baseReport, receipt, status]);

  useEffect(() => {
    const persistWallet = report?.walletAddress ?? connectedAddress;
    if (!report || !transactionId || !persistWallet || status === 'pending') return;

    const existing = getTransactionReport(persistWallet, transactionId);
    if (existing) {
      updateTransactionReport(persistWallet, transactionId, status, report);
    } else {
      saveTransactionReport(report);
    }
  }, [report, transactionId, connectedAddress, status]);

  if (!report || !transactionId) {
    return (
      <div className="transaction-report-page finapp-secondary-page" style={{ minHeight: '100vh' }}>
        <div className="appHeader">
          <div className="left">
            <button type="button" className="headerButton goBack" onClick={handleBack} aria-label="Go back">
              <AppIcon icon="lucide:chevron-left" />
            </button>
          </div>
          <div className="pageTitle">Transaction Detail</div>
          <div className="right">
            <button type="button" className="headerButton" onClick={handleClose} aria-label="Close">
              <AppIcon icon="lucide:x" />
            </button>
          </div>
        </div>
        <div id="appCapsule" className="full-height section mt-3">
          <p className="text-center text-secondary">Transaction not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-report-page finapp-secondary-page" style={{ minHeight: '100vh' }}>
      <div className="appHeader">
        <div className="left">
          <button type="button" className="headerButton goBack" onClick={handleBack} aria-label="Go back">
            <AppIcon icon="lucide:chevron-left" />
          </button>
        </div>
        <div className="pageTitle">Transaction Detail</div>
        <div className="right">
          <button type="button" className="headerButton" onClick={handleClose} aria-label="Close">
            <AppIcon icon="lucide:x" />
          </button>
        </div>
      </div>

      <div id="appCapsule" className="full-height">
        <FinappTransactionReport
          title={reportTitle(status, report.kind)}
          status={status}
          kind={report.kind}
          source={report.source}
          fields={report.fields}
          hash={transactionId}
          footer={
            <>
              {status === 'success' && report.kind === 'edex-approve' && (
                <button type="button" className="btn btn-primary btn-lg btn-block finapp-action-btn" onClick={handleClose}>
                  Continue to swap
                </button>
              )}
              {status === 'success' && report.kind === 'credit-card-buy' && (
                <button type="button" className="btn btn-primary btn-lg btn-block finapp-action-btn" onClick={handleClose}>
                  Continue
                </button>
              )}
              {status === 'success' && report.kind === 'activate-approve' && (
                <button type="button" className="btn btn-primary btn-lg btn-block finapp-action-btn" onClick={handleClose}>
                  Continue activation
                </button>
              )}
              {report.kind === 'activate-package' && status === 'failed' && (
                <button
                  type="button"
                  className="btn btn-primary btn-lg btn-block finapp-action-btn"
                  onClick={() => navigate('/Activate')}
                >
                  Try activation again
                </button>
              )}
              {report.source === 'activate' ||
              report.source === 'edex' ||
              report.source === 'pending-stars' ? (
                <button
                  type="button"
                  className="btn btn-text-secondary btn-block mt-2"
                  onClick={handleBack}
                >
                  {report.source === 'activate'
                    ? 'View activation history'
                    : report.source === 'pending-stars'
                      ? 'View pending stars history'
                      : 'View transaction history'}
                </button>
              ) : null}
              <button type="button" className="btn btn-text-secondary btn-block mt-2" onClick={handleClose}>
                Close
              </button>
            </>
          }
        />
      </div>
    </div>
  );
}

export default TransactionReport;
