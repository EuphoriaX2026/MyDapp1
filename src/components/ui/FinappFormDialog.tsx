import type { FormEvent, ReactNode } from 'react';
import { Modal } from '../Modal';

export interface FinappFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** Input label */
  fieldLabel: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  inputId?: string;
  placeholder?: string;
  autoFocus?: boolean;
  /** Optional extra fields below the main input */
  children?: ReactNode;
}

export function FinappFormDialog({
  isOpen,
  onClose,
  title,
  fieldLabel,
  value,
  onChange,
  onSubmit,
  submitLabel = 'SAVE',
  cancelLabel = 'CANCEL',
  inputId = 'finapp-form-dialog-input',
  placeholder,
  autoFocus = true,
  children,
}: FinappFormDialogProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="modal-header">
        <h5 className="modal-title">{title}</h5>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="modal-body text-start mb-2">
          <div className="form-group basic">
            <div className="input-wrapper">
              <label className="label" htmlFor={inputId}>
                {fieldLabel}
              </label>
              <input
                type="text"
                className="form-control"
                id={inputId}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                autoFocus={autoFocus}
              />
            </div>
          </div>
          {children}
        </div>
        <div className="modal-footer">
          <div className="btn-inline">
            <button type="button" className="btn btn-text-secondary" onClick={onClose}>
              {cancelLabel}
            </button>
            <button type="submit" className="btn btn-text-primary">
              {submitLabel}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
