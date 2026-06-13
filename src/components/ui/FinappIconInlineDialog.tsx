import { AppIcon } from '../icons/AppIcon';
import { Modal } from '../Modal';

export interface FinappIconInlineDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  body: string;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function FinappIconInlineDialog({
  isOpen,
  onClose,
  title,
  body,
  onConfirm,
  confirmLabel = 'CONFIRM',
  cancelLabel = 'CANCEL',
}: FinappIconInlineDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="modal-header">
        <h5 className="modal-title">{title}</h5>
      </div>
      <div className="modal-body">{body}</div>
      <div className="modal-footer">
        <div className="btn-inline">
          <button type="button" className="btn btn-text-danger finapp-dialog-inline-btn" onClick={onClose}>
            <AppIcon icon="lucide:x" className="finapp-dialog-inline-btn__icon" aria-hidden />
            {cancelLabel}
          </button>
          <button
            type="button"
            className="btn btn-text-primary finapp-dialog-inline-btn"
            onClick={handleConfirm}
          >
            <AppIcon icon="lucide:check" className="finapp-dialog-inline-btn__icon" aria-hidden />
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
