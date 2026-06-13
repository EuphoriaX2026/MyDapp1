import { AppIcon } from '../components/icons/AppIcon';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ActivateRealmCatalog } from '../components/activate/ActivateRealmCatalog';
import { useActivateCheckout } from '../hooks/useActivateCheckout';
import type { StoreRealmProduct } from '../data/storeRealmProducts';
import { getTransactionHistoryPath } from '../config/transactionHistoryTabs';
import '../styles/activate-page.css';

const PackagesPage: React.FC = () => {
  const navigate = useNavigate();
  const { proceedToInvoice, networkFeePOL } = useActivateCheckout();

  const handleProceedToInvoice = (
    product: StoreRealmProduct,
    priceWei: bigint,
    priceE1: number,
    isRenewal: boolean,
  ) => {
    proceedToInvoice(product, priceWei, priceE1, isRenewal);
  };

  return (
    <>
      <div className="appHeader activate-app-header">
        <div className="left">
          <button
            type="button"
            className="headerButton goBack activate-header-btn"
            onClick={() => navigate('/')}
            aria-label="Back to dashboard"
          >
            <AppIcon icon="lucide:chevron-left" />
          </button>
        </div>
        <div className="pageTitle">Activate</div>
        <div className="right">
          <button
            type="button"
            className="headerButton activate-header-btn"
            onClick={() => navigate(getTransactionHistoryPath('activate'))}
            aria-label="Activation history"
          >
            <AppIcon icon="lucide:history" />
          </button>
        </div>
      </div>

      <div className="activate-page-root overflow-x-hidden pb-24">
        <ActivateRealmCatalog
          onProceedToInvoice={handleProceedToInvoice}
          networkFeePOL={networkFeePOL}
        />
      </div>
    </>
  );
};

export default PackagesPage;
