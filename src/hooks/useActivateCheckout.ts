import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGasPrice } from 'wagmi';
import { formatUnits } from 'viem';
import {
  getRealmDisplayName,
  parseRealmGroupNumber,
  type StoreRealmProduct,
} from '../data/storeRealmProducts';
import type { ActivatePackageSelection, ActivationFlowKind } from '../types/activate';

const ESTIMATED_GAS_UNITS = BigInt(200_000);

export function useActivateCheckout() {
  const navigate = useNavigate();
  const { data: gasPriceData } = useGasPrice({ query: { refetchInterval: 15_000 } });

  const networkFeeWei = gasPriceData ? gasPriceData * ESTIMATED_GAS_UNITS : null;
  const networkFeePOL = networkFeeWei ? Number(formatUnits(networkFeeWei, 18)) : null;

  const proceedToInvoice = useCallback(
    (
      product: StoreRealmProduct,
      priceWei: bigint,
      priceE1: number,
      isRenewal: boolean,
    ) => {
      const groupIdx = parseRealmGroupNumber(product.level);
      const selection: ActivatePackageSelection = {
        productId: product.id,
        groupIdx,
        name: getRealmDisplayName(product.name),
        level: product.level,
        img: product.img,
        themeHex: product.themeHex,
        flowKind: 'renewal-e1' satisfies ActivationFlowKind,
        isRenewal,
        requiredE1Wei: priceWei.toString(),
        requiredE1: priceE1,
      };

      navigate('/checking', {
        state: {
          selection,
          totalSubtotal: priceE1,
          totalErx: priceE1,
          erxPriceUsd: 1,
          paymentToken: 'E1' as const,
          checkoutSource: 'activate' as const,
          returnPath: '/Activate',
        },
      });
    },
    [navigate],
  );

  return { proceedToInvoice, networkFeePOL };
}
