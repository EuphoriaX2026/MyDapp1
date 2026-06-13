import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import { formatEther, maxUint256 } from 'viem';
import { TITAN_CONTRACTS } from '../../config/my-titan-contracts';
import ActivatorABI from '../../abis/Activator-titan.json';
import IERC20ABI from '../../abis/erx-token.json';
import { Loader } from '../../components/Loader';
import { ActivateActivationReviewStage } from '../../components/activate/ActivateActivationReviewStage';
import { ActivateApproveReviewStage } from '../../components/activate/ActivateApproveReviewStage';
import { ActivateTxStatusStage } from '../../components/activate/ActivateTxStatusStage';
import { EDEX_TOKEN_META } from '../../config/edex-tokens';
import { useWalletTxNotification } from '../../hooks/useWalletTxNotification';
import {
  activatorSpender,
  hasE1Allowance,
} from '../../utils/e1Approval';
import { buildActivateTransactionReport } from '../../utils/buildTransactionReportRecord';
import { getTransactionReport, saveTransactionReport } from '../../utils/transactionReportStore';
import { getActivationTypeLabel } from '../../utils/activateLabels';
import { formatAmountSmart } from '../../utils/formatNumber';
import type { ActivateCheckoutState } from '../../types/activate';
import '../../styles/activate-page.css';

type TxStatus = 'pending' | 'success' | 'failed' | 'skipped';

interface TxResult {
  id: string;
  productName: string;
  status: TxStatus;
  hash?: string;
  failCount: number;
}

type ExecutionView =
  | 'approve-review'
  | 'approve-success'
  | 'activate-review'
  | 'activate-success'
  | 'activate-failed';

const APPROVE_TX_ID = 'approve-spend';

function activationTxId(groupIdx: number): string {
  return `activate-g${groupIdx}`;
}

export const ActivateExecution = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const publicClient = usePublicClient();
  const { address, isConnected } = useAccount();
  const { notifyConfirming, notifySuccess, notifyError, clearNotification } =
    useWalletTxNotification();

  const state = location.state as ActivateCheckoutState | null;
  const returnPath = state?.returnPath ?? '/Activate';
  const selection = state?.selection;
  const requiredWei = selection ? BigInt(selection.requiredE1Wei) : 0n;
  const activateTxId = selection ? activationTxId(selection.groupIdx) : null;

  const [txResults, setTxResults] = useState<TxResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [approveSuccessHash, setApproveSuccessHash] = useState<`0x${string}` | undefined>();
  const [approveTxHash, setApproveTxHash] = useState<`0x${string}` | undefined>();
  const [activateTxHash, setActivateTxHash] = useState<`0x${string}` | undefined>();

  const spender = activatorSpender();
  const e1TokenMeta = EDEX_TOKEN_META.E1;

  const activationType = selection ? getActivationTypeLabel(selection) : '—';

  const requiredE1Label = useMemo(() => {
    if (!selection) return '—';
    const e1Amount = Number(requiredWei) / 10 ** e1TokenMeta.decimals;
    return formatAmountSmart(e1Amount);
  }, [e1TokenMeta.decimals, requiredWei, selection]);

  const { data: allowanceRaw, refetch: refetchAllowance } = useReadContract({
    address: TITAN_CONTRACTS.E1 as `0x${string}`,
    abi: IERC20ABI.abi,
    functionName: 'allowance',
    args: address ? [address, spender] : undefined,
    query: { enabled: !!address },
  });

  const needsE1Approval = useMemo(() => {
    const allowance = (allowanceRaw as bigint | undefined) ?? 0n;
    return !hasE1Allowance(allowance, requiredWei);
  }, [allowanceRaw, requiredWei]);

  const { writeContractAsync, isPending: isApproveWritePending } = useWriteContract();
  const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed, data: approveReceipt } =
    useWaitForTransactionReceipt({
      hash: approveTxHash,
    });

  const { isLoading: isActivateConfirming, isSuccess: isActivateConfirmed, data: activateReceipt } =
    useWaitForTransactionReceipt({
      hash: activateTxHash,
    });

  const isApproveTxBusy =
    isApproveWritePending || (!!approveTxHash && isApproveConfirming && !approveSuccessHash);

  const activateRow = txResults.find((r) => r.id === activateTxId);

  const isActivateTxBusy =
    isProcessing ||
    (!!activateTxHash && isActivateConfirming && activateRow?.status === 'pending');

  const persistActivateReport = useCallback(
    (
      hash: `0x${string}`,
      kind: 'activate-approve' | 'activate-package',
      success: boolean,
      meta?: { blockNumber?: number; gasPaidPol?: string; confirmedAt?: string },
    ) => {
      if (!address || !selection) return;
      const report = buildActivateTransactionReport({
        hash,
        kind,
        status: success ? 'success' : 'failed',
        walletAddress: address,
        packageName: selection.name,
        e1Amount: kind === 'activate-package' ? requiredE1Label : undefined,
        activationType: kind === 'activate-package' ? activationType : undefined,
        blockNumber: meta?.blockNumber,
        gasPaidPol: meta?.gasPaidPol,
        createdAt: meta?.confirmedAt,
        returnTo: '/Activate',
      });
      saveTransactionReport(report);
    },
    [address, activationType, requiredE1Label, selection],
  );

  useEffect(() => {
    if (!state?.selection) {
      navigate('/Activate', { replace: true });
      return;
    }

    if (initialized) return;

    setTxResults([
      {
        id: APPROVE_TX_ID,
        productName: 'Approve E1',
        status: 'pending',
        failCount: 0,
      },
      {
        id: activateTxId!,
        productName: selection!.name,
        status: 'pending',
        failCount: 0,
      },
    ]);
    setInitialized(true);
  }, [state, navigate, initialized, selection, activateTxId]);

  useEffect(() => {
    if (!initialized || !selection || allowanceRaw === undefined) return;

    const allowance = allowanceRaw as bigint;
    if (!hasE1Allowance(allowance, requiredWei)) return;

    setTxResults((prev) => {
      const approveRow = prev.find((r) => r.id === APPROVE_TX_ID);
      if (!approveRow || approveRow.status !== 'pending') return prev;
      return prev.map((r) =>
        r.id === APPROVE_TX_ID ? { ...r, status: 'success' as const } : r,
      );
    });
  }, [initialized, selection, allowanceRaw, requiredWei]);

  useEffect(() => {
    if (isApproveWritePending) {
      notifyConfirming('Confirm unlimited E1 approval in your wallet…');
      return;
    }
    if (isApproveConfirming && approveTxHash && !approveSuccessHash) {
      notifyConfirming('Approval submitted — confirming on Polygon…');
    }
  }, [approveTxHash, approveSuccessHash, isApproveConfirming, isApproveWritePending, notifyConfirming]);

  useEffect(() => {
    if (!isApproveConfirmed || !approveTxHash || !address) return;

    void (async () => {
      const success = approveReceipt?.status === 'success';
      let blockNumber: number | undefined;
      let gasPaidPol: string | undefined;
      let confirmedAt = new Date().toISOString();

      if (approveReceipt) {
        blockNumber = Number(approveReceipt.blockNumber);
        gasPaidPol = formatEther(
          approveReceipt.gasUsed * approveReceipt.effectiveGasPrice,
        );
        if (publicClient) {
          try {
            const block = await publicClient.getBlock({ blockNumber: approveReceipt.blockNumber });
            confirmedAt = new Date(Number(block.timestamp) * 1000).toISOString();
          } catch {
            /* keep now */
          }
        }
      }

      persistActivateReport(approveTxHash, 'activate-approve', success, {
        blockNumber,
        gasPaidPol,
        confirmedAt,
      });

      if (success) {
        await refetchAllowance();
        setApproveSuccessHash(approveTxHash);
        setTxResults((prev) =>
          prev.map((res) =>
            res.id === APPROVE_TX_ID
              ? { ...res, status: 'success', hash: approveTxHash, failCount: 0 }
              : res,
          ),
        );
        notifySuccess('Unlimited E1 approval completed.');
      } else {
        notifyError('E1 approval failed on-chain.');
      }
      clearNotification();
    })();
  }, [
    address,
    approveReceipt,
    approveTxHash,
    clearNotification,
    isApproveConfirmed,
    notifyError,
    notifySuccess,
    persistActivateReport,
    publicClient,
    refetchAllowance,
  ]);

  useEffect(() => {
    if (!isActivateConfirmed || !activateTxHash || !activateTxId) return;

    void (async () => {
      const success = activateReceipt?.status === 'success';
      let blockNumber: number | undefined;
      let gasPaidPol: string | undefined;
      let confirmedAt = new Date().toISOString();

      if (activateReceipt) {
        blockNumber = Number(activateReceipt.blockNumber);
        gasPaidPol = formatEther(
          activateReceipt.gasUsed * activateReceipt.effectiveGasPrice,
        );
        if (publicClient) {
          try {
            const block = await publicClient.getBlock({ blockNumber: activateReceipt.blockNumber });
            confirmedAt = new Date(Number(block.timestamp) * 1000).toISOString();
          } catch {
            /* keep now */
          }
        }
      }

      persistActivateReport(activateTxHash, 'activate-package', success, {
        blockNumber,
        gasPaidPol,
        confirmedAt,
      });

      setTxResults((prev) =>
        prev.map((res) =>
          res.id === activateTxId
            ? {
                ...res,
                status: success ? 'success' : 'failed',
                hash: activateTxHash,
                failCount: success ? 0 : res.failCount + 1,
              }
            : res,
        ),
      );

      if (success) {
        notifySuccess(`${selection?.name ?? 'Package'} activation completed.`);
      } else {
        notifyError('Activation failed on-chain. You can try again.');
      }
      clearNotification();
      setIsProcessing(false);
      setActivateTxHash(undefined);
    })();
  }, [
    activateReceipt,
    activateTxHash,
    activateTxId,
    clearNotification,
    isActivateConfirmed,
    notifyError,
    notifySuccess,
    persistActivateReport,
    publicClient,
    selection?.name,
  ]);

  const approveRow = txResults.find((r) => r.id === APPROVE_TX_ID);

  const executionView = useMemo((): ExecutionView | null => {
    if (!initialized || !selection) return null;

    if (approveSuccessHash) return 'approve-success';

    if (needsE1Approval && approveRow?.status === 'pending') {
      return 'approve-review';
    }

    if (activateRow?.status === 'failed') return 'activate-failed';

    if (activateRow?.status === 'success' && activateRow.hash) {
      return 'activate-success';
    }

    return 'activate-review';
  }, [
    approveRow?.status,
    approveSuccessHash,
    activateRow?.hash,
    activateRow?.status,
    initialized,
    needsE1Approval,
    selection,
  ]);

  const executeActivation = async () => {
    if (!isConnected || !address || !selection || !activateTxId || isProcessing) return;

    setIsProcessing(true);
    notifyConfirming(`Confirm ${selection.name} activation in your wallet…`);

    try {
      const txHash = await writeContractAsync({
        address: TITAN_CONTRACTS.Activator as `0x${string}`,
        abi: ActivatorABI.abi,
        functionName: 'activatePackage',
        args: [address, selection.groupIdx],
      });
      setActivateTxHash(txHash);
      notifyConfirming('Activation submitted — confirming on Polygon…');
    } catch (error) {
      console.error('Failed to activate package', error);
      setTxResults((prev) =>
        prev.map((res) =>
          res.id === activateTxId
            ? { ...res, status: 'failed', failCount: res.failCount + 1 }
            : res,
        ),
      );
      notifyError('Activation was not completed.');
      clearNotification();
      setIsProcessing(false);
    }
  };

  const executeE1Approve = async () => {
    if (!isConnected || !address || isApproveTxBusy) return;

    setApproveSuccessHash(undefined);
    setApproveTxHash(undefined);

    try {
      const hash = await writeContractAsync({
        address: TITAN_CONTRACTS.E1 as `0x${string}`,
        abi: IERC20ABI.abi,
        functionName: 'approve',
        args: [spender, maxUint256],
      });
      setApproveTxHash(hash);
    } catch (error) {
      console.error('E1 approve failed', error);
      notifyError('E1 approval was not completed.');
      clearNotification();
    }
  };

  const handleApproveContinue = () => {
    setApproveSuccessHash(undefined);
    setApproveTxHash(undefined);
  };

  const handleApproveCancel = () => {
    if (isApproveTxBusy) return;
    navigate('/Activate', { replace: false });
  };

  const handleClose = () => {
    navigate(returnPath, { replace: true });
  };

  const handleActivationRetry = () => {
    if (!activateTxId) return;
    setTxResults((prev) =>
      prev.map((res) =>
        res.id === activateTxId ? { ...res, status: 'pending', hash: undefined } : res,
      ),
    );
    void executeActivation();
  };

  if (!state?.selection || !initialized || !executionView) return <Loader />;

  const failedActivationHash = activateRow?.hash as `0x${string}` | undefined;

  return (
    <>
      <div className="appHeader activate-app-header">
        <div className="left" />
        <div className="pageTitle" />
        <div className="right" />
      </div>

      <div className="activate-page-root overflow-x-hidden pb-28">
        <div className="activate-content-width relative z-10 mx-auto flex w-full flex-col gap-3 pt-1">
          {executionView === 'approve-review' ? (
            <ActivateApproveReviewStage
              payToken={e1TokenMeta}
              payAmount="Unlimited"
              receiveAmount="Max allowance"
              activationCostLabel={requiredE1Label}
              isBusy={isApproveTxBusy}
              onConfirm={() => {
                void executeE1Approve();
              }}
              onCancel={handleApproveCancel}
            />
          ) : null}

          {executionView === 'approve-success' && approveSuccessHash ? (
            <ActivateTxStatusStage
              status="success"
              sectionLabel="Activate"
              actionLabel="Token approval"
              txHash={approveSuccessHash}
              kind="activate-approve"
              primaryLabel="Continue"
              onPrimary={handleApproveContinue}
              onClose={handleClose}
            />
          ) : null}

          {executionView === 'activate-review' && selection ? (
            <ActivateActivationReviewStage
              selection={selection}
              requiredE1Label={requiredE1Label}
              isBusy={isActivateTxBusy}
              onConfirm={() => {
                void executeActivation();
              }}
              onCancel={() => navigate('/Activate', { replace: false })}
            />
          ) : null}

          {executionView === 'activate-failed' && selection ? (
            <ActivateTxStatusStage
              status="failed"
              sectionLabel="Activate"
              actionLabel={selection.name}
              txHash={failedActivationHash}
              kind="activate-package"
              onRetry={handleActivationRetry}
              onClose={handleClose}
              isBusy={isActivateTxBusy}
            />
          ) : null}

          {executionView === 'activate-success' && activateRow?.hash && selection ? (
            <ActivateTxStatusStage
              status="success"
              sectionLabel="Activate"
              actionLabel={selection.name}
              txHash={activateRow.hash as `0x${string}`}
              kind="activate-package"
              primaryLabel="View transaction details"
              onPrimary={() => {
                const stored =
                  address && activateRow.hash
                    ? getTransactionReport(address, activateRow.hash)
                    : undefined;
                navigate(`/transaction/${activateRow.hash}`, {
                  state: { ...stored, returnTo: '/Activate' },
                });
              }}
              onClose={handleClose}
            />
          ) : null}
        </div>
      </div>

    </>
  );
};

export default ActivateExecution;
export type { ActivateCheckoutState };
