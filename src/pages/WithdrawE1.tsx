import { useCallback, useEffect, useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import type { Address } from 'viem';

import { Modal } from '../components/Modal';
import { WalletFlowPageShell } from '../components/wallet/WalletFlowPageShell';
import { Loader } from '../components/Loader';
import { useWithdrawE1Quote } from '../hooks/useWithdrawE1Quote';
import { getGroupLevelLabel } from '../data/storeRealmProducts';
import { formatUsdWei } from '../utils/withdrawE1Math';
import { CURRENT_NETWORK_INFO } from '../config/networks';
import { formatAddressForDisplay } from '../utils/addressValidation';
import { contracts } from '../config/wagmi';
import ManagerABI from '../abis/Manager-titan.json';
import '../styles/send-money-page.css';
import '../styles/withdraw-e1-page.css';

function formatBigInt(value: bigint) {
  return value.toString();
}

export default function WithdrawE1() {
  const { isConnected } = useAccount();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successHash, setSuccessHash] = useState<`0x${string}` | null>(null);
  const [pendingHash, setPendingHash] = useState<Address | undefined>();

  const {
    targetWeekId,
    totalShares,
    pricePerShareUSD,
    highestActiveGroup,
    baseCapUsd,
    vipCapUsd,
    isSubjectToLifeFee,
    lifetimeWithdrawalsLabel,
    quote,
    grossLabel,
    feeLabel,
    netE1Label,
    feePercentLabel,
    canWithdraw,
    isLoading,
    refetchStocks,
  } = useWithdrawE1Quote();

  const { isPending, writeContractAsync } = useWriteContract();
  const {
    isLoading: isWaitingForBlock,
    isSuccess: isTxConfirmed,
    isError: isTxFailed,
    data: txReceipt,
  } = useWaitForTransactionReceipt({ hash: pendingHash });

  const walletFlowActive = isPending || isWaitingForBlock;

  const resetPending = useCallback(() => {
    setPendingHash(undefined);
  }, []);

  useEffect(() => {
    if (!pendingHash || isWaitingForBlock) return;

    if (isTxConfirmed && txReceipt?.status === 'success') {
      void refetchStocks();
      setSuccessHash(pendingHash);
      setErrorMessage(null);
      resetPending();
      return;
    }

    if (isTxFailed || txReceipt?.status === 'reverted') {
      setErrorMessage('Transaction failed on-chain. Please try again.');
      resetPending();
    }
  }, [
    pendingHash,
    isWaitingForBlock,
    isTxConfirmed,
    isTxFailed,
    txReceipt,
    refetchStocks,
    resetPending,
  ]);

  const handleConfirmWithdraw = async () => {
    setConfirmOpen(false);
    if (!canWithdraw || walletFlowActive) return;
    setErrorMessage(null);
    setSuccessHash(null);

    try {
      const hash = await writeContractAsync({
        address: contracts.TITAN_MANAGER as `0x${string}`,
        abi: ManagerABI.abi,
        functionName: 'claimWeeklySharePayout',
        args: [targetWeekId],
        chainId: CURRENT_NETWORK_INFO.chainId,
      });
      setPendingHash(hash as Address);
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Transaction was rejected. Please try again.';
      setErrorMessage(message);
    }
  };

  const highestRealmName =
    highestActiveGroup > 0
      ? getGroupLevelLabel(highestActiveGroup)
      : '—';

  const explorerTxUrl = successHash
    ? `${CURRENT_NETWORK_INFO.explorer}/tx/${successHash}`
    : null;

  return (
    <WalletFlowPageShell title="Withdraw E1" titleMedium variant="flat" backTo="/MyWallet">
      <div className="send-money-page withdraw-e1-page section">
        {errorMessage ? (
          <div className="withdraw-e1-error" role="alert">
            {errorMessage}
          </div>
        ) : null}

        {successHash ? (
          <div className="withdraw-e1-success">
            Withdrawal confirmed for Week {targetWeekId.toString()}.
            {explorerTxUrl ? (
              <>
                {' '}
                <a href={explorerTxUrl} target="_blank" rel="noopener noreferrer">
                  {formatAddressForDisplay(successHash, 8, 6)}
                </a>
              </>
            ) : null}
          </div>
        ) : null}

        {walletFlowActive ? (
          <div className="withdraw-e1-processing" role="status">
            Processing Transaction...
          </div>
        ) : null}

        {isLoading ? (
          <div className="withdraw-e1-loading">
            <Loader />
          </div>
        ) : (
          <>
            <div className="withdraw-e1-surface">
              <p className="withdraw-e1-desc">
                Convert last week&apos;s RFT stocks into E1 via Manager.claimWeeklySharePayout.
                Points calculation is handled separately on Pending Stars.
              </p>

              <h2 className="withdraw-e1-section-title">Target Week</h2>
              <div className="withdraw-e1-card">
                <div className="withdraw-e1-row">
                  <span className="withdraw-e1-label">Week ID</span>
                  <span className="withdraw-e1-value">{targetWeekId.toString()}</span>
                </div>
                <div className="withdraw-e1-row">
                  <span className="withdraw-e1-label">Total Shares (RFT)</span>
                  <span className="withdraw-e1-value">{formatBigInt(totalShares)}</span>
                </div>
                <div className="withdraw-e1-row">
                  <span className="withdraw-e1-label">Price per Share (USD)</span>
                  <span className="withdraw-e1-value">
                    ${formatUsdWei(pricePerShareUSD, 4)}
                  </span>
                </div>
                <div className="withdraw-e1-row">
                  <span className="withdraw-e1-label">Total Gross Value</span>
                  <span className="withdraw-e1-value withdraw-e1-value--accent">
                    ${grossLabel}
                  </span>
                </div>
              </div>

              <h2 className="withdraw-e1-section-title">Income Caps</h2>
              <div className="withdraw-e1-card">
                <div className="withdraw-e1-row">
                  <span className="withdraw-e1-label">Highest Active Group</span>
                  <span className="withdraw-e1-value">{highestRealmName}</span>
                </div>
                <div className="withdraw-e1-row">
                  <span className="withdraw-e1-label">Base Cap</span>
                  <span className="withdraw-e1-value">${formatUsdWei(baseCapUsd)}</span>
                </div>
                <div className="withdraw-e1-row">
                  <span className="withdraw-e1-label">VIP Cap</span>
                  <span className="withdraw-e1-value">${formatUsdWei(vipCapUsd)}</span>
                </div>
                <div className="withdraw-e1-row">
                  <span className="withdraw-e1-label">Lifetime Withdrawals (USD)</span>
                  <span className="withdraw-e1-value">{lifetimeWithdrawalsLabel}</span>
                </div>
                {isSubjectToLifeFee ? (
                  <div className="withdraw-e1-row">
                    <span className="withdraw-e1-label">Life Fee Applies</span>
                    <span className="withdraw-e1-value">Yes</span>
                  </div>
                ) : null}
              </div>

              <h2 className="withdraw-e1-section-title">Payout Summary</h2>
              <div className="withdraw-e1-card">
                <div className="withdraw-e1-row">
                  <span className="withdraw-e1-label">Gross Amount</span>
                  <span className="withdraw-e1-value">${grossLabel}</span>
                </div>
                <div className="withdraw-e1-row">
                  <span className="withdraw-e1-label">Fee Percentage</span>
                  <span className="withdraw-e1-value">{feePercentLabel}</span>
                </div>
                <div className="withdraw-e1-row">
                  <span className="withdraw-e1-label">Fee Amount (USD)</span>
                  <span className="withdraw-e1-value">${feeLabel}</span>
                </div>
                <div className="withdraw-e1-row">
                  <span className="withdraw-e1-label">Net Amount (E1)</span>
                  <span className="withdraw-e1-value withdraw-e1-value--accent">
                    {netE1Label} E1
                  </span>
                </div>
              </div>
            </div>

            {!isConnected ? (
              <p className="withdraw-e1-empty">Connect your wallet to withdraw E1.</p>
            ) : !canWithdraw ? (
              <p className="withdraw-e1-empty">
                No withdrawable RFT shares for Week {targetWeekId.toString()}, or this week was
                already claimed.
              </p>
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-block btn-lg finapp-action-btn withdraw-e1-action-btn"
                onClick={() => setConfirmOpen(true)}
                disabled={walletFlowActive}
              >
                Withdraw
              </button>
            )}
          </>
        )}

        <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <div className="modal-header">
            <h5 className="modal-title">Confirm Withdrawal</h5>
          </div>
          <div className="modal-body text-start">
            <p className="withdraw-e1-desc mb-0">
              You are authorizing us to burn your RFT shares in exchange for{' '}
              <strong>{netE1Label} E1</strong>. Confirm?
            </p>
          </div>
          <div className="modal-footer">
            <div className="btn-inline">
              <button
                type="button"
                className="btn btn-text-secondary"
                onClick={() => setConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-text-primary"
                onClick={handleConfirmWithdraw}
              >
                Confirm
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </WalletFlowPageShell>
  );
}
