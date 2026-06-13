// src/components/Modal.tsx

import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div 
        className="modal-backdrop fade show" 
        onClick={onClose}
        style={{ display: 'block' }}
      ></div>
      <div 
        className="modal fade dialogbox show" 
        style={{ display: 'block' }}
        tabIndex={-1} 
        role="dialog"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};