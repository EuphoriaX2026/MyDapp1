import { useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';

/** Runs callback when the connected wallet address changes or disconnects. */
export function useOnWalletChange(onChange: () => void) {
  const { address, isConnected } = useAccount();
  const activeAddress = isConnected ? address : undefined;
  const prevRef = useRef<string | undefined>(activeAddress);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const prev = prevRef.current?.toLowerCase();
    const current = activeAddress?.toLowerCase();

    if (prev === current) return;

    prevRef.current = activeAddress;

    if (prev !== undefined || current !== undefined) {
      onChangeRef.current();
    }
  }, [activeAddress]);
}
