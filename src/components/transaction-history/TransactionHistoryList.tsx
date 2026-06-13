import { Link } from 'react-router-dom';
import type { TransactionReportRecord } from '../../types/transactionReport';
import { splitReportDateTime, statusLabel } from '../../utils/formatTransactionReport';
import { resolveTransactionReportVisual } from '../../utils/transactionReportVisual';
import { buildTransactionSummaryLine } from '../../utils/transactionHistorySummary';
import { getTransactionHistoryPath } from '../../config/transactionHistoryTabs';
import type { TransactionHistoryTabId } from '../../config/transactionHistoryTabs';

interface TransactionHistoryListProps {
  transactions: TransactionReportRecord[];
  activeTab: TransactionHistoryTabId;
}

export function TransactionHistoryList({ transactions, activeTab }: TransactionHistoryListProps) {
  const returnTo = getTransactionHistoryPath(activeTab);

  return (
    <div className="card w-full transaction-history-list-card">
      <ul className="listview flush transparent no-line image-listview detailed-list mt-1 mb-1">
        {transactions.map((tx) => {
          const { date, time } = splitReportDateTime(tx.createdAt);
          const visual = resolveTransactionReportVisual(tx.kind, tx.status, tx.source);
          const statusClass =
            tx.status === 'success'
              ? 'transaction-history-status--success'
              : tx.status === 'failed'
                ? 'transaction-history-status--failed'
                : 'transaction-history-status--pending';

          return (
            <li key={tx.hash}>
              <Link
                to={`/transaction/${tx.hash}`}
                state={{ ...tx, returnTo }}
                className="item transaction-history-item"
              >
                <div className={`icon-box ${visual.iconboxClass}`}>{visual.renderIcon()}</div>
                <div className="in">
                  <div className="transaction-history-item__main">
                    <span className="transaction-report-value transaction-history-item__summary">
                      {buildTransactionSummaryLine(tx)}
                    </span>
                    <div className="text-small text-secondary transaction-history-item__meta">
                      {tx.section} · {tx.action}
                    </div>
                  </div>
                  <div className="text-end transaction-history-item__aside">
                    <span
                      className={`transaction-history-status ${statusClass}`}
                      aria-label={`Status: ${statusLabel(tx.status)}`}
                    >
                      {statusLabel(tx.status)}
                    </span>
                    <div className="text-small transaction-history-item__date">{date}</div>
                    <div className="text-small text-secondary">{time}</div>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
