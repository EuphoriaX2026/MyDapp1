import { useMemo } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { TITAN_CONTRACTS } from '../config/my-titan-contracts';
import PanelABI from '../abis/Panel-titan.json';
import { useTitanOneDaySeconds } from './useTitanOneDaySeconds';
import { chainSecondsToDisplayDays } from '../utils/titanTimeScale';

export function useUserGroupRemainingDays(groupIdx: number): number {
  const { address } = useAccount();
  const oneDaySeconds = useTitanOneDaySeconds();

  const { data: groupTimestamps } = useReadContract({
    address: TITAN_CONTRACTS.Panel as `0x${string}`,
    abi: PanelABI.abi,
    functionName: 'getUserGroupTimestamps',
    args: address && groupIdx > 0 ? [address, groupIdx] : undefined,
    query: { enabled: !!address && groupIdx > 0 },
  });

  return useMemo(() => {
    if (!groupTimestamps) return 0;
    const expiryTimestamp = Number((groupTimestamps as bigint[] | number[])[1]);
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (expiryTimestamp <= currentTimestamp) return 0;
    return chainSecondsToDisplayDays(expiryTimestamp - currentTimestamp, oneDaySeconds);
  }, [groupTimestamps, oneDaySeconds]);
}
