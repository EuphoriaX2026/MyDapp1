import { createContext, useCallback, useContext, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useConfig } from 'wagmi';
import { buildIsUserRegisteredQueryOptions } from '../utils/registerContractQuery';

type WalletRegistrationContextValue = {
  /** Optimistically mark an address as registered after a successful register tx. */
  markRegistered: (address: string) => void;
  /** Force a fresh on-chain read for an address. */
  invalidateRegistration: (address: string) => void;
};

const WalletRegistrationContext = createContext<WalletRegistrationContextValue | undefined>(
  undefined,
);

export function WalletRegistrationProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const config = useConfig();

  const markRegistered = useCallback(
    (address: string) => {
      if (!address) return;
      const queryOptions = buildIsUserRegisteredQueryOptions(config, address);
      queryClient.setQueryData(queryOptions.queryKey, true);
    },
    [config, queryClient],
  );

  const invalidateRegistration = useCallback(
    (address: string) => {
      if (!address) return;
      const queryOptions = buildIsUserRegisteredQueryOptions(config, address);
      void queryClient.invalidateQueries({ queryKey: queryOptions.queryKey });
    },
    [config, queryClient],
  );

  return (
    <WalletRegistrationContext.Provider value={{ markRegistered, invalidateRegistration }}>
      {children}
    </WalletRegistrationContext.Provider>
  );
}

export function useWalletRegistrationCache() {
  const ctx = useContext(WalletRegistrationContext);
  if (!ctx) {
    throw new Error('useWalletRegistrationCache must be used within WalletRegistrationProvider');
  }
  return ctx;
}
