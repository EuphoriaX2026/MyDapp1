import type { ReactNode } from 'react';
import type {
  TransactionReportField,
  TransactionReportSource,
  TransactionReportStatus,
} from '../types/transactionReport';
import { CURRENT_NETWORK_INFO } from '../config/networks';
import { formatAddressForDisplay } from '../utils/addressValidation';
import { resolveTransactionReportVisual } from '../utils/transactionReportVisual';
import '../styles/transaction-report-page.css';

export interface FinappTransactionReportProps {
  title: string;
  status: TransactionReportStatus;
  fields: TransactionReportField[];
  hash?: string;
  kind?: string;
  source?: TransactionReportSource;
  errorMessage?: string;
  embedded?: boolean;
  className?: string;
  footer?: ReactNode;
}

function toneClass(tone?: TransactionReportField['tone']) {
  if (tone === 'success') return 'text-success';
  if (tone === 'danger') return 'text-danger';
  if (tone === 'warning') return 'text-warning';
  if (tone === 'muted') return 'text-secondary';
  return undefined;
}

export function FinappTransactionReport({
  title,
  status,
  fields,
  hash,
  kind = 'transfer',
  source,
  errorMessage,
  embedded = false,
  className = '',
  footer,
}: FinappTransactionReportProps) {
  const explorerTxUrl = hash ? `${CURRENT_NETWORK_INFO.explorer}/tx/${hash}` : null;
  const visual = resolveTransactionReportVisual(kind, status, source);

  return (
    <div
      className={`transaction-report-page${embedded ? ' transaction-report-page--embedded' : ''} ${className}`.trim()}
    >
      <div className={embedded ? 'section' : 'section mt-2 mb-2'}>
        <div className="listed-detail mt-3">
          <div className="icon-wrapper">
            <div className={`iconbox ${visual.iconboxClass}`}>{visual.renderIcon()}</div>
          </div>
          <h3 className="text-center mt-2 transaction-report-heading">{title}</h3>
        </div>

        <ul className="listview flush transparent simple-listview no-space mt-3 transaction-report-list">
          {fields.map((field) => (
            <li key={field.id}>
              <span className="transaction-report-label">{field.label}</span>
              <span className={`transaction-report-value ${toneClass(field.tone) ?? ''}`.trim()}>
                {field.value}
              </span>
            </li>
          ))}
          {hash && explorerTxUrl ? (
            <li>
              <span className="transaction-report-label">Transaction Hash</span>
              <span className="transaction-report-value">
                <a
                  href={explorerTxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transaction-report-hash-link fw-medium"
                >
                  {formatAddressForDisplay(hash, 10, 8)}
                </a>
              </span>
            </li>
          ) : null}
        </ul>

        {errorMessage ? (
          <div className="alert alert-danger mb-0 mt-2" role="alert">
            {errorMessage}
          </div>
        ) : null}

        {footer ? <div className="transaction-report-actions">{footer}</div> : null}
      </div>
    </div>
  );
}

export default FinappTransactionReport;
