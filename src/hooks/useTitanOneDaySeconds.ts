import { useReadContract } from 'wagmi';
import { TITAN_CONTRACTS } from '../config/my-titan-contracts';
import ConfigsABI from '../abis/Configs-titan.json';
import { MAINNET_ONE_DAY_SECONDS } from '../utils/titanTimeScale';

/** On-chain length of one "logical day" from Titan Configs (86400 mainnet, compressed on Amoy). */
export function useTitanOneDaySeconds(): number {
  const { data } = useReadContract({
    address: TITAN_CONTRACTS.Configs as `0x${string}`,
    abi: ConfigsABI.abi,
    functionName: 'oneDay',
  });

  if (data == null) return MAINNET_ONE_DAY_SECONDS;
  const seconds = Number(data as bigint);
  return seconds > 0 ? seconds : MAINNET_ONE_DAY_SECONDS;
}
