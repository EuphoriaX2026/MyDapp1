import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import {
  useAccount,
  useBalance,
  usePublicClient,
  useReadContract,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import { BaseError, formatEther, keccak256, maxUint256, toHex } from 'viem';
import StoreABI from '../abis/Store-titan.json';
import IERC20ABI from '../abis/erx-token.json';
import { TITAN_CONTRACTS } from '../config/my-titan-contracts';
import { ERX_CONTRACTS } from '../config/erx-contracts';
import { EDEX_TOKEN_META } from '../config/edex-tokens';
import { EdexSwapReviewSheet } from './edex/EdexSwapReviewSheet';
import { useTitanRouterErxAddress } from '../hooks/useTitanRouterErx';
import { useEuphoriaExchange } from '../hooks/useEuphoriaExchange';
import { useBankErxPriceUsd } from '../hooks/useBankErxPriceUsd';
import { decimalUsdPriceToWei } from '../utils/edexSwapMath';
import { formatFinancialNumber } from '../utils/formatNumber';
import { STORE_REALM_PRODUCTS } from '../data/storeRealmProducts';
import { media } from '../assets/media';
import { formatContractError, STORE_ERX_PIPELINE_MESSAGE } from '../utils/contractErrors';
import { buildCreditCardTransactionReport } from '../utils/buildTransactionReportRecord';
import { saveTransactionReport } from '../utils/transactionReportStore';
import { useWalletTxNotification } from '../hooks/useWalletTxNotification';
import '../styles/finapp-bank-cards.css';

const CARD_VARIANTS = [
  '',
  'bg-secondary',
  'bg-success',
  'bg-danger',
  'bg-warning',
  'bg-info',
  'bg-dark',
] as const;

const REALM_ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'] as const;

const E_ONE_LOGO = media.logos.eOne;
const E1_MARK_LOGO = media.logos.app;
const WAD = 10n ** 18n;
/** Active Store on Amoy (hotfix) — buyProduct target */
const STORE_ADDRESS = TITAN_CONTRACTS.Store as `0x${string}`;
const BANK_ADDRESS = TITAN_CONTRACTS.Bank as `0x${string}`;
const EDEX_ERX_ADDRESS = ERX_CONTRACTS.ERX as `0x${string}`;

function formatErxFromWei(wei: bigint): string {
  return formatFinancialNumber(Number(wei) / 1e18, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

type CardBuyState = 'unavailable' | 'not_listed' | 'insufficient' | 'approve' | 'buy' | 'processing' | 'setup_pending';
type PendingTxKind = 'approve' | 'buy';

type StoreCatalogProduct = {
  priceUSD?: bigint;
  isActive: boolean;
};

function realmProductId(roman: (typeof REALM_ROMAN)[number]): `0x${string}` {
  return keccak256(toHex(`Realm ${roman}`));
}

/** requiredErx = (cardUsdPrice * 1e18) / erxPriceUsd — both USD values in 18-decimal fixed point. */
function usdPriceToErxWei(cardUsdPrice: number, erxPriceUsdWei: bigint): bigint {
  if (erxPriceUsdWei <= 0n || cardUsdPrice <= 0) return 0n;
  const cardUsdWei = BigInt(cardUsdPrice) * WAD;
  return (cardUsdWei * WAD) / erxPriceUsdWei;
}

function getButtonLabel(state: CardBuyState): string {
  switch (state) {
    case 'unavailable':
      return 'Not Available';
    case 'not_listed':
      return 'Not Listed';
    case 'setup_pending':
      return 'Unavailable';
    case 'insufficient':
      return 'Insufficient ERX';
    case 'approve':
      return 'Approve ERX';
    case 'processing':
      return 'Processing...';
    default:
      return 'Buy Card';
  }
}

const FINAPP_BANK_CARDS = STORE_REALM_PRODUCTS.map((product, index) => ({
  product,
  variant: CARD_VARIANTS[index] ?? '',
  priceLabel: `$${product.price}`,
  productId: realmProductId(REALM_ROMAN[index] ?? 'I'),
}));

const CATALOG_CONTRACT_CALLS = FINAPP_BANK_CARDS.map(({ productId }) => ({
  address: STORE_ADDRESS,
  abi: StoreABI.abi,
  functionName: 'catalog' as const,
  args: [productId] as const,
}));

function getRevertMessage(error: unknown): string {
  return formatContractError(error);
}

interface FinappBankCardsProps {
  appearance?: 'default' | 'edex';
}

type PendingBuyMeta = {
  cardLabel: string;
  payErxAmount: string;
  receiveE1Amount: string;
};

export function FinappBankCards({ appearance = 'default' }: FinappBankCardsProps) {
  const isEdex = appearance === 'edex';
  const navigate = useNavigate();
  const erxAddress = useTitanRouterErxAddress();
  const routerErxDiffersFromEdex =
    erxAddress.toLowerCase() !== EDEX_ERX_ADDRESS.toLowerCase();
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const publicClient = usePublicClient();
  const { writeContractAsync, isPending: isWritePending } = useWriteContract();

  const [activeProductId, setActiveProductId] = useState<number | null>(null);
  const [pendingTxKind, setPendingTxKind] = useState<PendingTxKind | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [purchaseNotice, setPurchaseNotice] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [approveSuccessHash, setApproveSuccessHash] = useState<`0x${string}` | undefined>();
  const [pendingApproveProductId, setPendingApproveProductId] = useState<number | null>(null);
  const [pendingBuyMeta, setPendingBuyMeta] = useState<PendingBuyMeta | null>(null);
  const processedTxRef = useRef<string | null>(null);
  const { notifyConfirming, notifySuccess, notifyError, clearNotification } =
    useWalletTxNotification();

  const erxTokenMeta = useMemo(
    () => ({
      ...EDEX_TOKEN_META.ERX,
      address: erxAddress,
    }),
    [erxAddress],
  );

  const { currentPrice: edexErxPriceUsd, isLoadingPrice: isEdexPriceLoading } =
    useEuphoriaExchange();

  const { erxPriceUsdWei: bankErxPriceWei } = useBankErxPriceUsd();

  /** Prefer live EDex spot; fall back to Bank oracle if EDex quote unavailable. */
  const erxPriceUsdWei = useMemo(() => {
    if (edexErxPriceUsd > 0) {
      return decimalUsdPriceToWei(edexErxPriceUsd);
    }
    return bankErxPriceWei;
  }, [bankErxPriceWei, edexErxPriceUsd]);

  const { data: catalogResults } = useReadContracts({
    contracts: CATALOG_CONTRACT_CALLS,
  });

  const catalogActiveByProductId = useMemo(() => {
    const map = new Map<number, boolean>();
    FINAPP_BANK_CARDS.forEach(({ product }, index) => {
      const row = catalogResults?.[index]?.result as StoreCatalogProduct | undefined;
      if (row !== undefined && (row.priceUSD ?? 0n) > 0n) {
        map.set(product.id, row.isActive);
      }
    });
    return map;
  }, [catalogResults]);

  const catalogListedByProductId = useMemo(() => {
    const map = new Map<number, boolean>();
    FINAPP_BANK_CARDS.forEach(({ product }, index) => {
      const row = catalogResults?.[index]?.result as StoreCatalogProduct | undefined;
      if (row !== undefined) {
        map.set(product.id, (row.priceUSD ?? 0n) > 0n);
      }
    });
    return map;
  }, [catalogResults]);

  const { data: storeBankAllowanceRaw } = useReadContract({
    address: erxAddress,
    abi: IERC20ABI.abi,
    functionName: 'allowance',
    args: [STORE_ADDRESS, BANK_ADDRESS],
    query: { refetchInterval: 30_000 },
  });

  const storeBankAllowanceWei = (storeBankAllowanceRaw as bigint | undefined) ?? 0n;
  const isStoreDepositReady = storeBankAllowanceWei > 0n;

  const { data: erxBalanceData, refetch: refetchErxBalance } = useBalance({
    address,
    token: erxAddress,
    query: { enabled: !!address },
  });

  const erxBalanceWei = erxBalanceData?.value ?? 0n;

  const { data: edexErxBalanceData } = useBalance({
    address,
    token: EDEX_ERX_ADDRESS,
    query: { enabled: !!address && routerErxDiffersFromEdex },
  });
  const edexErxBalanceWei = edexErxBalanceData?.value ?? 0n;

  const { data: allowanceRaw, refetch: refetchAllowance } = useReadContract({
    address: erxAddress,
    abi: IERC20ABI.abi,
    functionName: 'allowance',
    args: address ? [address, STORE_ADDRESS] : undefined,
    query: { enabled: !!address },
  });

  const allowanceWei = (allowanceRaw as bigint | undefined) ?? 0n;

  const erxRequiredByProductId = useMemo(() => {
    const map = new Map<number, bigint>();
    FINAPP_BANK_CARDS.forEach(({ product }) => {
      map.set(product.id, usdPriceToErxWei(product.price, erxPriceUsdWei));
    });
    return map;
  }, [erxPriceUsdWei]);

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const isCardProcessing = useCallback(
    (productId: number) =>
      activeProductId === productId && (isWritePending || (!!txHash && isConfirming)),
    [activeProductId, isConfirming, isWritePending, txHash],
  );

  const needsApproval = useCallback(
    (requiredWei: bigint) => requiredWei > 0n && allowanceWei < requiredWei,
    [allowanceWei],
  );

  const getCardState = useCallback(
    (productId: number): CardBuyState => {
      if (isCardProcessing(productId)) return 'processing';

      const catalogKnown = catalogListedByProductId.has(productId);
      const isListed = catalogListedByProductId.get(productId);
      if (catalogKnown && isListed === false) return 'not_listed';

      const catalogActiveKnown = catalogActiveByProductId.has(productId);
      const isActive = catalogActiveByProductId.get(productId);
      if (catalogActiveKnown && isActive === false) return 'unavailable';

      if (isConnected && address && !isStoreDepositReady) return 'setup_pending';

      if (!isConnected || !address) return 'buy';

      const required = erxRequiredByProductId.get(productId) ?? 0n;
      if (required <= 0n || erxBalanceWei < required) return 'insufficient';
      if (needsApproval(required)) return 'approve';
      return 'buy';
    },
    [
      address,
      catalogActiveByProductId,
      catalogListedByProductId,
      erxBalanceWei,
      erxRequiredByProductId,
      isCardProcessing,
      isConnected,
      needsApproval,
      isStoreDepositReady,
    ],
  );

  const isAnyProcessing = activeProductId !== null;

  const dualErxNotice = useMemo(() => {
    if (!routerErxDiffersFromEdex || !isConnected || !address) return null;

    const firstCard = FINAPP_BANK_CARDS[0];
    if (!firstCard) return null;
    const requiredWei = erxRequiredByProductId.get(firstCard.product.id) ?? 0n;
    if (requiredWei <= 0n) return null;

    if (edexErxBalanceWei >= requiredWei && erxBalanceWei < requiredWei) {
      return (
        `Credit cards use Titan Router ERX (not EDex swap ERX). ` +
        `You have ${formatErxFromWei(edexErxBalanceWei)} EDex ERX but need ${formatErxFromWei(requiredWei)} Router ERX for this card (you have ${formatErxFromWei(erxBalanceWei)}). ` +
        `Ask protocol admin to link Router ERX to the EDex token, or hold Router ERX in this wallet.`
      );
    }
    return null;
  }, [
    address,
    edexErxBalanceWei,
    erxBalanceWei,
    erxRequiredByProductId,
    isConnected,
    routerErxDiffersFromEdex,
  ]);

  const resetPendingTx = useCallback(() => {
    setActiveProductId(null);
    setPendingTxKind(null);
    setTxHash(undefined);
  }, []);

  const resetApproveReview = useCallback(() => {
    setReviewOpen(false);
    setApproveSuccessHash(undefined);
    setPendingApproveProductId(null);
    resetPendingTx();
  }, [resetPendingTx]);

  useEffect(() => {
    processedTxRef.current = null;
    resetApproveReview();
    setPurchaseNotice(null);
    setPendingBuyMeta(null);
  }, [address, resetApproveReview]);

  const isApproveTxBusy =
    pendingTxKind === 'approve' &&
    (isWritePending || (!!txHash && isConfirming && !approveSuccessHash));

  const isBuyTxBusy =
    pendingTxKind === 'buy' && (isWritePending || (!!txHash && isConfirming));

  useEffect(() => {
    if (isApproveTxBusy && !approveSuccessHash) {
      notifyConfirming('Confirming unlimited ERX approval on Polygon…');
    }
  }, [approveSuccessHash, isApproveTxBusy, notifyConfirming]);

  useEffect(() => {
    if (isBuyTxBusy) {
      notifyConfirming('Confirming card purchase on Polygon…');
    }
  }, [isBuyTxBusy, notifyConfirming]);

  useEffect(() => {
    if (!approveSuccessHash) return;
    notifySuccess('Unlimited ERX approval completed.');
    clearNotification();
  }, [approveSuccessHash, clearNotification, notifySuccess]);

  useEffect(() => {
    if (!isConfirmed || !pendingTxKind || activeProductId === null || !txHash || !address) return;
    if (processedTxRef.current === txHash) return;

    if (pendingTxKind === 'approve') {
      processedTxRef.current = txHash;
      void (async () => {
        try {
          await refetchAllowance();
          setApproveSuccessHash(txHash);
        } catch (err) {
          console.error('[FinappBankCards] post-approve refresh failed:', err);
        }
      })();
      return;
    }

    if (pendingTxKind !== 'buy' || !pendingBuyMeta) return;

    processedTxRef.current = txHash;

    void (async () => {
      let success = true;
      let blockNumber: number | undefined;
      let gasPaidPol: string | undefined;
      let confirmedAt = new Date().toISOString();

      try {
        if (publicClient) {
          const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
          success = receipt.status === 'success';
          blockNumber = Number(receipt.blockNumber);
          gasPaidPol = formatEther(receipt.gasUsed * receipt.effectiveGasPrice);
          const block = await publicClient.getBlock({ blockNumber: receipt.blockNumber });
          confirmedAt = new Date(Number(block.timestamp) * 1000).toISOString();
        }
      } catch (err) {
        console.error('[FinappBankCards] buy receipt failed:', err);
        success = false;
      }

      try {
        await refetchErxBalance();
        await refetchAllowance();
      } catch (err) {
        console.error('[FinappBankCards] post-buy refresh failed:', err);
      }

      const report = buildCreditCardTransactionReport({
        hash: txHash,
        status: success ? 'success' : 'failed',
        walletAddress: address,
        cardLabel: pendingBuyMeta.cardLabel,
        payErxAmount: pendingBuyMeta.payErxAmount,
        receiveE1Amount: pendingBuyMeta.receiveE1Amount,
        gasPaidPol,
        blockNumber,
        createdAt: confirmedAt,
        returnTo: '/edex',
      });

      saveTransactionReport(report);
      if (success) {
        notifySuccess('Card purchase completed.');
      } else {
        notifyError('Card purchase failed on-chain.');
      }
      clearNotification();
      navigate(`/transaction/${txHash}`, { state: report });
      resetPendingTx();
      setPendingBuyMeta(null);
    })();
  }, [
    activeProductId,
    address,
    isConfirmed,
    navigate,
    pendingBuyMeta,
    pendingTxKind,
    publicClient,
    refetchAllowance,
    refetchErxBalance,
    resetPendingTx,
    txHash,
  ]);

  const handleApproveContinue = useCallback(() => {
    resetApproveReview();
  }, [resetApproveReview]);

  const openApproveReview = useCallback((productId: number) => {
    setApproveSuccessHash(undefined);
    setPendingApproveProductId(productId);
    setReviewOpen(true);
  }, []);

  const executeApprove = useCallback(
    async (productId: number) => {
      if (!isConnected || !address || isAnyProcessing) return;

      const requiredWei = erxRequiredByProductId.get(productId) ?? 0n;
      if (requiredWei <= 0n || erxBalanceWei < requiredWei || !needsApproval(requiredWei)) return;

      setActiveProductId(productId);
      setPendingTxKind('approve');
      setTxHash(undefined);

      try {
        const hash = await writeContractAsync({
          address: erxAddress,
          abi: IERC20ABI.abi,
          functionName: 'approve',
          args: [STORE_ADDRESS, maxUint256],
        });
        setTxHash(hash);
      } catch (err) {
        console.error('[FinappBankCards] approve failed:', err);
        resetPendingTx();
      }
    },
    [
      address,
      erxBalanceWei,
      erxRequiredByProductId,
      isAnyProcessing,
      isConnected,
      needsApproval,
      erxAddress,
      resetPendingTx,
      writeContractAsync,
    ],
  );

  const confirmApproveReview = useCallback(async () => {
    if (pendingApproveProductId === null) return;
    await executeApprove(pendingApproveProductId);
  }, [executeApprove, pendingApproveProductId]);

  const handleBuy = useCallback(
    async (productId: number, realmRoman: (typeof REALM_ROMAN)[number]) => {
      if (!isConnected || !address || isAnyProcessing) return;

      const requiredWei = erxRequiredByProductId.get(productId) ?? 0n;
      if (requiredWei <= 0n || erxBalanceWei < requiredWei || needsApproval(requiredWei)) return;

      const catalogKnown = catalogActiveByProductId.has(productId);
      const isActive = catalogActiveByProductId.get(productId);
      if (catalogKnown && isActive === false) return;

      if (!isStoreDepositReady) {
        setPurchaseNotice(STORE_ERX_PIPELINE_MESSAGE);
        return;
      }

      const productIdBytes = realmProductId(realmRoman);
      const buyArgs = [address, productIdBytes] as const;

      try {
        if (!publicClient) {
          throw new Error('Public client unavailable. Cannot simulate buyProduct.');
        }

        await publicClient.simulateContract({
          address: STORE_ADDRESS,
          abi: StoreABI.abi,
          functionName: 'buyProduct',
          args: buyArgs,
          account: address,
        });
      } catch (error) {
        const revertMessage = getRevertMessage(error);
        console.error(
          '🔥 SMART CONTRACT REVERT REASON:',
          error instanceof BaseError
            ? error.shortMessage || error.message
            : revertMessage,
        );
        alert(revertMessage);
        return;
      }

      const cardEntry = FINAPP_BANK_CARDS.find(({ product }) => product.id === productId);

      setPurchaseNotice(null);
      setActiveProductId(productId);
      setPendingTxKind('buy');
      setPendingBuyMeta({
        cardLabel: `Realm ${realmRoman}`,
        payErxAmount: formatErxFromWei(requiredWei),
        receiveE1Amount: String(cardEntry?.product.price ?? 0),
      });
      setTxHash(undefined);
      processedTxRef.current = null;

      try {
        const hash = await writeContractAsync({
          address: STORE_ADDRESS,
          abi: StoreABI.abi,
          functionName: 'buyProduct',
          args: buyArgs,
        });
        setTxHash(hash);
      } catch (err) {
        const revertMessage = getRevertMessage(err);
        console.error('🔥 SMART CONTRACT REVERT REASON:', revertMessage);
        console.error('[FinappBankCards] buyProduct failed:', err);
        alert(revertMessage);
        resetPendingTx();
      }
    },
    [
      address,
      catalogActiveByProductId,
      erxBalanceWei,
      erxRequiredByProductId,
      isAnyProcessing,
      isConnected,
      needsApproval,
      isStoreDepositReady,
      publicClient,
      erxAddress,
      resetPendingTx,
      writeContractAsync,
    ],
  );

  const handleCardAction = useCallback(
    (productId: number, realmIndex: number) => {
      const state = getCardState(productId);
      if (state === 'unavailable' || state === 'not_listed' || state === 'insufficient' || state === 'processing' || state === 'setup_pending') return;

      if (!isConnected || !address) {
        openConnectModal?.();
        return;
      }

      const roman = REALM_ROMAN[realmIndex] ?? 'I';
      if (state === 'approve') {
        openApproveReview(productId);
        return;
      }
      void handleBuy(productId, roman);
    },
    [address, getCardState, handleBuy, isConnected, openApproveReview, openConnectModal],
  );

  return (
    <>
      <div className={`section mt-2 finapp-bank-cards${isEdex ? ' finapp-bank-cards--edex' : ''}`}>
        {!isStoreDepositReady && isConnected && (
          <p className="finapp-bank-cards-notice" role="alert">
            {STORE_ERX_PIPELINE_MESSAGE}
          </p>
        )}
        {dualErxNotice && (
          <p className="finapp-bank-cards-notice finapp-bank-cards-notice--error" role="alert">
            {dualErxNotice}
          </p>
        )}
        {purchaseNotice && (
          <p className="finapp-bank-cards-notice finapp-bank-cards-notice--error" role="alert">
            {purchaseNotice}
          </p>
        )}
        {FINAPP_BANK_CARDS.map(({ product, variant, priceLabel }, index) => {
          const state = getCardState(product.id);
          const isProcessing = state === 'processing';
          const requiredErxWei = erxRequiredByProductId.get(product.id) ?? 0n;
          const erxCostLabel =
            requiredErxWei > 0n && !isEdexPriceLoading && erxPriceUsdWei > 0n
              ? `${formatErxFromWei(requiredErxWei)} ERX`
              : isEdexPriceLoading
                ? '… ERX'
                : null;
          const disabled =
            state === 'unavailable' ||
            state === 'not_listed' ||
            state === 'insufficient' ||
            state === 'setup_pending' ||
            isProcessing ||
            (isAnyProcessing && activeProductId !== product.id);

          return (
            <div key={product.id} className={`card-block mb-2 ${variant}`.trim()}>
              <div className="card-main">
                <div className="card-brand-slot" aria-hidden={false}>
                  <img src={E_ONE_LOGO} alt="E.ONE" className="card-brand-logo" />
                </div>

                <div className="card-price-corner">
                  <span className="card-price-value">{priceLabel}</span>
                  {isEdex && erxCostLabel ? (
                    <span className="card-erx-cost">{erxCostLabel}</span>
                  ) : null}
                </div>

                <div className="card-footer-row">
                  <div className="in">
                    <div className="card-number">
                      <span className="label">{isEdex ? 'E1 Cash Back' : 'Cash Back'}</span>
                      100%
                    </div>
                    {!isEdex ? (
                      <div className="bottom">
                        <div className="card-expiry">
                          <span className="label">Token</span>
                          <img src={E1_MARK_LOGO} alt="E1" className="card-e1-mark" />
                        </div>
                        <div className="card-ccv">
                          <span className="label">Fee</span>
                          0%
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    className="card-buy-btn"
                    disabled={disabled}
                    onClick={() => handleCardAction(product.id, index)}
                  >
                    {getButtonLabel(state)}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <EdexSwapReviewSheet
        open={reviewOpen}
        kind="approve"
        payToken={erxTokenMeta}
        receiveToken={erxTokenMeta}
        payAmount="Unlimited"
        receiveAmount="Max allowance"
        spenderLabel="Store"
        sectionLabel="Credit Card"
        onConfirm={() => {
          void confirmApproveReview();
        }}
        onClose={() => {
          if (isApproveTxBusy) return;
          resetApproveReview();
        }}
        isBusy={isApproveTxBusy}
        approveSuccessHash={approveSuccessHash}
        onApproveContinue={handleApproveContinue}
      />

    </>
  );
}
