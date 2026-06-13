import { AppIcon } from '../icons/AppIcon';
import type { ReactNode } from 'react';

interface FinappOverlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Panel max width — defaults to Accounts modal width */
  maxWidthClass?: string;
  ariaLabel?: string;
}

export function FinappOverlayModal({
  isOpen,
  onClose,
  title,
  children,
  maxWidthClass = 'max-w-md',
  ariaLabel,
}: FinappOverlayModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/40 pt-[60px] backdrop-blur-md"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`relative max-h-[70vh] w-[calc(100%-32px)] overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl ${maxWidthClass}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={ariaLabel ?? title}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="m-0 text-[18px] font-normal text-[#1C1C1E]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-gray-100 p-1 active:scale-95"
            aria-label="Close"
          >
            <AppIcon icon="lucide:x" size={20} className="text-[#8E8E93]" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
