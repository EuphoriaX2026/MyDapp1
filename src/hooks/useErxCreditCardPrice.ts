import { useMemo } from 'react';
import { useBankErxPriceUsd } from './useBankErxPriceUsd';
import { usdPriceToErxWei } from '../utils/realmStoreProduct';

export function useErxCreditCardPrice(cardUsdPrice: number) {
  const { erxPriceUsdWei, isLoading, isError } = useBankErxPriceUsd();

  return useMemo(() => {
    const requiredErxWei = usdPriceToErxWei(cardUsdPrice, erxPriceUsdWei);
    const requiredErx =
      requiredErxWei > 0n ? Number(requiredErxWei) / 1e18 : null;

    return {
      erxPriceUsdWei,
      requiredErxWei,
      requiredErx,
      isLoading,
      isError,
    };
  }, [cardUsdPrice, erxPriceUsdWei, isError, isLoading]);
}
