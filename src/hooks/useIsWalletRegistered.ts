import { useAccount, useReadContract } from 'wagmi';
import {
  IS_USER_REGISTERED_FN,
  REGISTER_CONTRACT_ADDRESS,
  REGISTER_READ_ABI,
  normalizeWalletAddress,
} from '../utils/registerContractQuery';

export type UseIsWalletRegisteredOptions = {
  /** Defaults to the currently connected wallet when omitted. */
  address?: string | null;
  /** When false, skips the on-chain read. Defaults to true when an address is resolved. */
  enabled?: boolean;
};

function resolveOptions(
  optionsOrAddress?: UseIsWalletRegisteredOptions | string | null,
): UseIsWalletRegisteredOptions {
  if (typeof optionsOrAddress === 'string' || optionsOrAddress == null) {
    return { address: optionsOrAddress ?? undefined };
  }
  return optionsOrAddress;
}

/** Single source for `Register.isUserAddressRegistered` reads (shared wagmi/react-query cache). */
export function useIsWalletRegistered(
  optionsOrAddress?: UseIsWalletRegisteredOptions | string | null,
) {
  const { address: connectedAddress } = useAccount();
  const options = resolveOptions(optionsOrAddress);
  const resolvedAddress = options.address ?? connectedAddress ?? undefined;
  const enabled = options.enabled ?? !!resolvedAddress;

  const { data, isLoading, isFetched, isFetching, refetch, error } = useReadContract({
    address: REGISTER_CONTRACT_ADDRESS,
    abi: REGISTER_READ_ABI,
    functionName: IS_USER_REGISTERED_FN,
    args: resolvedAddress ? [normalizeWalletAddress(resolvedAddress)] : undefined,
    query: {
      enabled: enabled && !!resolvedAddress,
    },
  });

  return {
    address: resolvedAddress,
    isRegistered: data as boolean | undefined,
    isLoading,
    isFetched,
    isFetching,
    refetch,
    error,
  };
}
