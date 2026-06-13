import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { maxUint256, type Address } from 'viem';
import StoreABI from '../abis/Store-titan.json';
import ActivatorABI from '../abis/Activator-titan.json';
import IERC20ABI from '../abis/erx-token.json';
import { ERX_CONTRACTS } from '../config/erx-contracts';
import { TITAN_CONTRACTS } from '../config/my-titan-contracts';
import { activatorSpender, hasE1Allowance } from '../utils/e1Approval';

export type ZapStepId = 'approve-erx' | 'buy-card' | 'approve-e1' | 'activate';

export type ZapStepStatus = 'pending' | 'processing' | 'success' | 'failed';

export type ZapStep = {
  id: ZapStepId;
  label: string;
  status: ZapStepStatus;
  hash?: string;
  failCount: number;
};

const STEP_DEFS: { id: ZapStepId; label: string }[] = [
  { id: 'approve-erx', label: 'Approve ERX' },
  { id: 'buy-card', label: 'Buy Realm Credit Card' },
  { id: 'approve-e1', label: 'Approve E1' },
  { id: 'activate', label: 'Activate Package' },
];

const STORE_ADDRESS = TITAN_CONTRACTS.Store as Address;
const ERX_ADDRESS = ERX_CONTRACTS.ERX as Address;
const E1_ADDRESS = TITAN_CONTRACTS.E1 as Address;

function initialSteps(): ZapStep[] {
  return STEP_DEFS.map((s) => ({
    ...s,
    status: 'pending',
    failCount: 0,
  }));
}

export interface UseActivationZapParams {
  groupIdx: number;
  creditCardProductId: `0x${string}`;
  /** Minimum ERX for buy step — used to validate allowance before buy. */
  requiredErxWei: bigint;
  enabled: boolean;
}

export function useActivationZap({
  groupIdx,
  creditCardProductId,
  requiredErxWei,
  enabled,
}: UseActivationZapParams) {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [steps, setSteps] = useState<ZapStep[]>(initialSteps);
  const [started, setStarted] = useState(false);

  const activator = activatorSpender();

  const { data: erxAllowanceRaw, refetch: refetchErxAllowance } = useReadContract({
    address: ERX_ADDRESS,
    abi: IERC20ABI.abi,
    functionName: 'allowance',
    args: address ? [address, STORE_ADDRESS] : undefined,
    query: { enabled: enabled && !!address },
  });

  const { data: e1AllowanceRaw, refetch: refetchE1Allowance } = useReadContract({
    address: E1_ADDRESS,
    abi: IERC20ABI.abi,
    functionName: 'allowance',
    args: address ? [address, activator] : undefined,
    query: { enabled: enabled && !!address },
  });

  const erxAllowance = (erxAllowanceRaw as bigint | undefined) ?? 0n;
  const e1Allowance = (e1AllowanceRaw as bigint | undefined) ?? 0n;

  /** Auto-mark approve steps success when infinite allowance already granted. */
  useEffect(() => {
    if (!enabled || !address) return;

    setSteps((prev) => {
      let next = prev;
      const mark = (id: ZapStepId) => {
        const row = next.find((s) => s.id === id);
        if (!row || row.status === 'success') return;
        next = next.map((s) => (s.id === id ? { ...s, status: 'success' as const } : s));
      };

      if (hasE1Allowance(erxAllowance, requiredErxWei)) mark('approve-erx');
      if (hasE1Allowance(e1Allowance, 1n)) mark('approve-e1');

      return next;
    });
  }, [address, enabled, erxAllowance, e1Allowance, requiredErxWei]);

  const currentStep = useMemo(
    () => steps.find((s) => s.status !== 'success') ?? null,
    [steps],
  );

  const isComplete = steps.every((s) => s.status === 'success');
  const isProcessing = steps.some((s) => s.status === 'processing');

  const resetZap = useCallback(() => {
    setSteps(initialSteps());
    setStarted(false);
  }, []);

  const executeStep = useCallback(
    async (stepId: ZapStepId) => {
      if (!isConnected || !address || isProcessing) return;

      setSteps((prev) =>
        prev.map((s) =>
          s.id === stepId ? { ...s, status: 'processing' as const } : s,
        ),
      );

      try {
        let txHash: `0x${string}`;

        switch (stepId) {
          case 'approve-erx':
            if (hasE1Allowance(erxAllowance, requiredErxWei)) {
              setSteps((prev) =>
                prev.map((s) =>
                  s.id === stepId ? { ...s, status: 'success', failCount: 0 } : s,
                ),
              );
              return;
            }
            txHash = await writeContractAsync({
              address: ERX_ADDRESS,
              abi: IERC20ABI.abi,
              functionName: 'approve',
              args: [STORE_ADDRESS, maxUint256],
            });
            await refetchErxAllowance();
            break;

          case 'buy-card':
            txHash = await writeContractAsync({
              address: STORE_ADDRESS,
              abi: StoreABI.abi,
              functionName: 'buyProduct',
              args: [address, creditCardProductId],
            });
            break;

          case 'approve-e1':
            if (hasE1Allowance(e1Allowance, 1n)) {
              setSteps((prev) =>
                prev.map((s) =>
                  s.id === stepId ? { ...s, status: 'success', failCount: 0 } : s,
                ),
              );
              return;
            }
            txHash = await writeContractAsync({
              address: E1_ADDRESS,
              abi: IERC20ABI.abi,
              functionName: 'approve',
              args: [activator, maxUint256],
            });
            await refetchE1Allowance();
            break;

          case 'activate':
            txHash = await writeContractAsync({
              address: TITAN_CONTRACTS.Activator as Address,
              abi: ActivatorABI.abi,
              functionName: 'activatePackage',
              args: [address, groupIdx],
            });
            break;

          default:
            return;
        }

        setSteps((prev) =>
          prev.map((s) =>
            s.id === stepId
              ? { ...s, status: 'success', hash: txHash, failCount: 0 }
              : s,
          ),
        );

        const order: ZapStepId[] = ['approve-erx', 'buy-card', 'approve-e1', 'activate'];
        const nextId = order[order.indexOf(stepId) + 1];
        if (nextId) {
          window.setTimeout(() => {
            void executeStep(nextId);
          }, 350);
        }
      } catch (error) {
        console.error(`[useActivationZap] ${stepId} failed`, error);
        setSteps((prev) =>
          prev.map((s) =>
            s.id === stepId
              ? {
                  ...s,
                  status: 'failed' as const,
                  failCount: s.failCount + 1,
                }
              : s,
          ),
        );
      }
    },
    [
      activator,
      address,
      creditCardProductId,
      e1Allowance,
      erxAllowance,
      groupIdx,
      isConnected,
      isProcessing,
      refetchE1Allowance,
      refetchErxAllowance,
      requiredErxWei,
      writeContractAsync,
    ],
  );

  const startZap = useCallback(() => {
    setStarted(true);
    const first = steps.find((s) => s.status === 'pending' || s.status === 'failed');
    if (first) void executeStep(first.id);
  }, [executeStep, steps]);

  return {
    steps,
    currentStep,
    isComplete,
    isProcessing,
    started,
    startZap,
    retryStep: (stepId: ZapStepId) => {
      setSteps((prev) =>
        prev.map((s) =>
          s.id === stepId ? { ...s, status: 'pending' as const } : s,
        ),
      );
      void executeStep(stepId);
    },
    resetZap,
  };
}
