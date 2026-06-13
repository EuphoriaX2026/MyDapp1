import { useReadContract } from 'wagmi';
import RouterABI from '../abis/Router-titan.json';
import { ERX_CONTRACTS } from '../config/erx-contracts';
import { TITAN_CONTRACTS } from '../config/my-titan-contracts';

/**
 * ERX token the Titan Store uses for buyProduct (from Router.getERXToken).
 * On Amoy this may differ from ERX_CONTRACTS.ERX used by EDex swaps.
 */
export function useTitanRouterErxAddress(): `0x${string}` {
  const { data } = useReadContract({
    address: TITAN_CONTRACTS.Router as `0x${string}`,
    abi: RouterABI.abi,
    functionName: 'getERXToken',
    query: { refetchInterval: 60_000 },
  });

  const fromRouter = data as `0x${string}` | undefined;
  if (fromRouter && fromRouter !== '0x0000000000000000000000000000000000000000') {
    return fromRouter;
  }
  return ERX_CONTRACTS.ERX as `0x${string}`;
}
