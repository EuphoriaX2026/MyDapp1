import { useCallback, useState } from 'react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';
import { waitForTransactionReceipt } from '@wagmi/core';
import PanelABI from '../abis/Panel-titan.json';
import IERC20ABI from '../abis/erx-token.json';
import { config } from '../config/wagmi';
import { TITAN_CONTRACTS } from '../config/my-titan-contracts';
import type { StoreRealmProduct } from '../data/storeRealmProducts';

const E1_DECIMALS = 18;

export function useBuyRealmProduct() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { writeContractAsync } = useWriteContract();
  const [buyingProductId, setBuyingProductId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: allowanceRaw, refetch: refetchAllowance } = useReadContract({
    address: TITAN_CONTRACTS.E1 as `0x${string}`,
    abi: IERC20ABI.abi,
    functionName: 'allowance',
    args: address
      ? [address, TITAN_CONTRACTS.Panel as `0x${string}`]
      : undefined,
    query: { enabled: !!address },
  });

  const buyProduct = useCallback(
    async (product: StoreRealmProduct) => {
      setError(null);

      if (!isConnected || !address) {
        openConnectModal?.();
        return;
      }

      const priceWei = parseUnits(String(product.price), E1_DECIMALS);
      const allowance = (allowanceRaw as bigint | undefined) ?? 0n;

      setBuyingProductId(product.id);

      try {
        if (allowance < priceWei) {
          const approveHash = await writeContractAsync({
            address: TITAN_CONTRACTS.E1 as `0x${string}`,
            abi: IERC20ABI.abi,
            functionName: 'approve',
            args: [TITAN_CONTRACTS.Panel as `0x${string}`, priceWei],
          });
          await waitForTransactionReceipt(config, { hash: approveHash });
          await refetchAllowance();
        }

        const buyHash = await writeContractAsync({
          address: TITAN_CONTRACTS.Panel as `0x${string}`,
          abi: PanelABI.abi,
          functionName: 'buyProduct',
          args: [product.hash as `0x${string}`],
        });
        await waitForTransactionReceipt(config, { hash: buyHash });
      } catch (err) {
        console.error('Realm buy failed:', err);
        setError(err instanceof Error ? err.message : 'Purchase failed');
        throw err;
      } finally {
        setBuyingProductId(null);
      }
    },
    [
      address,
      allowanceRaw,
      isConnected,
      openConnectModal,
      refetchAllowance,
      writeContractAsync,
    ],
  );

  return {
    buyProduct,
    buyingProductId,
    isBuying: buyingProductId !== null,
    error,
    clearError: () => setError(null),
  };
}
