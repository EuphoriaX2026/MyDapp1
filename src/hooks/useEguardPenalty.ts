import { useReadContract } from 'wagmi';
import EGuardABI from '../abis/eguard.json';
import { ERX_CONTRACTS, isContractDeployed } from '../config/erx-contracts';

const eguardAbi = (EGuardABI as { abi?: unknown }).abi ?? EGuardABI;

export function useEguardPenalty(userAddress?: `0x${string}`) {
  const enabled = !!userAddress && isContractDeployed(ERX_CONTRACTS.EGuard);

  const { data: isPenalizedRaw, isLoading } = useReadContract({
    address: ERX_CONTRACTS.EGuard as `0x${string}`,
    abi: eguardAbi,
    functionName: 'isUserPenalized',
    args: userAddress ? [userAddress] : undefined,
    query: { enabled, refetchInterval: 15_000 },
  });

  return {
    isPenalized: isPenalizedRaw === true,
    isLoading: enabled && isLoading,
  };
}
