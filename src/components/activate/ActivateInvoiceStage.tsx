import InvoiceOutlineIcon from '@iconify-react/basil/invoice-outline';
import type { ReactNode } from 'react';
import { ActivateE1Logo } from './ActivateE1Logo';
import { formatAmountSmart, formatUsdSmart } from '../../utils/formatNumber';
import type { ActivatePackageSelection } from '../../types/activate';
import { getActivationTypeLabel } from '../../utils/activateLabels';

export interface ActivateInvoiceStageProps {
  selection: ActivatePackageSelection;
  totalSubtotal: number;
  totalErx: number;
  userBalance: number;
  paymentToken: string;
  invoiceDate: string;
  invoiceTime: string;
  signatureCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

function InvoiceRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <li>
      <span className="activate-invoice-row-label fw-normal">{label}</span>
      <span className="activate-invoice-row-value fw-normal">{value}</span>
    </li>
  );
}

export function ActivateInvoiceStage({
  selection,
  totalSubtotal,
  totalErx,
  userBalance,
  paymentToken,
  invoiceDate,
  invoiceTime,
  signatureCount,
  onConfirm,
  onCancel,
}: ActivateInvoiceStageProps) {
  const activationType = getActivationTypeLabel(selection);

  return (
    <div className="activate-invoice-stage">
      <div className="activate-invoice-iconbox" aria-hidden="true">
        <InvoiceOutlineIcon height="3rem" width="3rem" />
      </div>

      <h2 className="activate-invoice-title fw-bold">Invoice</h2>

      <div className="activate-invoice-panel">
        <ul className="activate-invoice-rows">
          <InvoiceRow label="Activation Type" value={activationType} />
          <InvoiceRow label="Package" value={selection.name} />
          <InvoiceRow
            label="Price"
            value={
              <span className="activate-invoice-price-value">
                {formatAmountSmart(totalErx)}
                <ActivateE1Logo className="activate-invoice-e1-logo h-4 w-auto" />
              </span>
            }
          />
          <InvoiceRow label="Total USD Value" value={formatUsdSmart(totalSubtotal)} />
          <InvoiceRow label="Date" value={invoiceDate} />
          <InvoiceRow label="Time" value={invoiceTime} />
          <InvoiceRow
            label="Your Balance"
            value={`${formatAmountSmart(userBalance)} ${paymentToken}`}
          />
          <InvoiceRow
            label="Required Execution"
            value={
              <span className="activate-invoice-price-value">
                ~ {formatAmountSmart(totalErx)}
                <ActivateE1Logo className="activate-invoice-e1-logo h-4 w-auto" />
              </span>
            }
          />
          <InvoiceRow label="Transactions" value={`${signatureCount} Signatures`} />
        </ul>
      </div>

      <div className="activate-invoice-actions">
        <button
          type="button"
          className="btn btn-primary btn-lg activate-invoice-confirm fw-medium"
          onClick={onConfirm}
        >
          Confirm
        </button>
        <button
          type="button"
          className="btn btn-text-secondary activate-invoice-cancel fw-medium"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
