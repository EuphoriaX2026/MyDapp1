// src/components/PackageModal.tsx

import React, { useState } from 'react';
import { CardData } from '../types';

interface PackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (quantity: number) => void;
  cardData: CardData | null;
}

export const PackageModal: React.FC<PackageModalProps> = ({ isOpen, onClose, onAdd, cardData }) => {
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  if (!isOpen || !cardData) {
    return null;
  }

  const quantityOptions = Array.from({ length: 10 }, (_, i) => i + 1);

  const handleAddClick = () => {
    onAdd(selectedQuantity);
    onClose();
  };

  return (
    <div className={`modal fade action-sheet ${isOpen ? 'show' : ''}`} style={{ display: isOpen ? 'block' : 'none' }} tabIndex={-1} role="dialog">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add Package</h5>
          </div>
          <div className="modal-body">
            <div className="action-sheet-content">
              <form>
                <div className="form-group basic">
                  <div className="input-wrapper">
                    <label className="label" htmlFor="quantitySelect">Package Number</label>
                    <select 
                      className="form-control custom-select" 
                      id="quantitySelect"
                      value={selectedQuantity}
                      onChange={(e) => setSelectedQuantity(parseInt(e.target.value))}
                    >
                      {quantityOptions.map(q => (
                        <option key={q} value={q}>{q} Package</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group basic mt-2">
                  <button type="button" className="btn btn-primary btn-block btn-lg" onClick={handleAddClick}>
                    Add to Report
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};