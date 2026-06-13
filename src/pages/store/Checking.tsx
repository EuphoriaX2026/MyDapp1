import { AppIcon } from '../../components/icons/AppIcon';
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { TITAN_CONTRACTS } from '../../config/my-titan-contracts'
import { ERX_CONTRACTS } from '../../config/erx-contracts'
import PanelABI from '../../abis/Panel-titan.json'
import StoreABI from '../../abis/Store-titan.json'
import IERC20ABI from '../../abis/erx-token.json' // Use our local ERC20 compliant ABI
import { Loader } from '../../components/Loader'
import { ReportItem } from '../../types'
import { GlassCard } from '../../components/ui/glass'
import { ActivateInvoiceStage } from '../../components/activate/ActivateInvoiceStage'
import { formatUsdSmart, formatAmountSmart } from '../../utils/formatNumber'
import type { ActivateCheckoutState } from '../../types/activate'
import '../../styles/activate-page.css'

interface TxResult {
    id: string; // unique composite id
    productName: string;
    status: 'pending' | 'success' | 'failed';
    hash?: string;
}

export const Checking = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { address, isConnected } = useAccount()
  
  // State from Store or Activate navigation
  const state = location.state as ({
      cartItems: ReportItem[];
      totalSubtotal: number;
      totalErx: number;
      erxPriceUsd: number;
      paymentToken: 'ERX' | 'E1';
      checkoutSource?: 'store' | 'activate';
      returnPath?: string;
  } | ActivateCheckoutState) | null;

  const checkoutSource = state?.checkoutSource ?? (state && 'paymentToken' in state && state.paymentToken === 'E1' ? 'activate' : 'store');
  const returnPath = state?.returnPath ?? (checkoutSource === 'activate' ? '/Activate' : '/store');
  const isActivateInvoice = checkoutSource === 'activate';
  const activateSelection = isActivateInvoice && state && 'selection' in state ? state.selection : null;

  const [currentDate, setCurrentDate] = useState('')
  const [invoiceDate, setInvoiceDate] = useState('')
  const [invoiceTime, setInvoiceTime] = useState('')
  const [txQueue, setTxQueue] = useState<{ id: string, hash: string, name: string }[]>([])
  const [txResults, setTxResults] = useState<TxResult[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (!state) {
      navigate(returnPath, { replace: true })
      return
    }

    const isActivate = checkoutSource === 'activate'
    const hasActivateSelection = isActivate && 'selection' in state && !!state.selection
    const hasStoreCart = !isActivate && 'cartItems' in state && state.cartItems?.length > 0

    if (!hasActivateSelection && !hasStoreCart) {
      navigate(returnPath, { replace: true })
      return
    }

    const now = new Date()
    setCurrentDate(
      now.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      }),
    )
    setInvoiceDate(
      now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    )
    setInvoiceTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }))

    if (isActivate) return

    const storeState = state as { cartItems: ReportItem[]; paymentToken: 'ERX' | 'E1' }
    // Initialize transaction results display based on quantities (store checkout only)
    if (txResults.length === 0) {
        const initialResults: TxResult[] = [];
        storeState.cartItems.forEach(item => {
            for(let i=0; i < item.quantity; i++) {
                initialResults.push({
                    id: `${item.id}-${i}`,
                    productName: `${item.name} (${i+1}/${item.quantity})`,
                    status: 'pending'
                });
                
                // Also populate execution queue
                setTxQueue(prev => [...prev, { id: `${item.id}-${i}`, hash: item.hash, name: `${item.name} (${i+1}/${item.quantity})` }]);
            }
        });
        
        // Inject an initial approval step
        initialResults.unshift({
            id: 'approve-spend',
            productName: `Approve ${storeState.paymentToken} Spend Limit`,
            status: 'pending'
        });
        setTxQueue(prev => [{ id: 'approve-spend', hash: 'approve', name: 'Approve Spend' }, ...prev]);
        
        setTxResults(initialResults);
    }
// Fix: Removed `txResults.length` dependency to prevent recursive triggering
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, navigate, returnPath, checkoutSource])

  const isE1 = !isActivateInvoice && state && 'paymentToken' in state && state.paymentToken === 'E1';
  const targetContractAddress = isE1 ? TITAN_CONTRACTS.Panel : TITAN_CONTRACTS.Store;
  const targetTokenAddress = isActivateInvoice
    ? TITAN_CONTRACTS.E1
    : isE1
      ? TITAN_CONTRACTS.E1
      : ERX_CONTRACTS.ERX;

  // Read User Balance
  const { data: tokenBalanceData } = useReadContract({
    address: targetTokenAddress as `0x${string}`,
    abi: IERC20ABI.abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  const tokenDecimals = isActivateInvoice || isE1 ? 18 : 18;
  const userTokenBalance = tokenBalanceData ? Number(formatUnits(tokenBalanceData as bigint, tokenDecimals)) : 0;

  // Wagmi Hooks for sequential transactions
  const { writeContractAsync } = useWriteContract()

  const handleConfirm = async () => {
    if (!isConnected || !address || !state || isProcessing) return
    setIsProcessing(true);

    try {
        // Find the first pending item to execute manually step-by-step
        const nextPendingItem = txResults.find(r => r.status === 'pending');
        if (!nextPendingItem) {
            setIsProcessing(false);
            return;
        }

        const item = txQueue.find(q => q.id === nextPendingItem.id);
        if (!item) {
             setIsProcessing(false);
             return;
        }

        try {
            let txHash: `0x${string}`;

            if (item.id === 'approve-spend') {
                // Ensure sufficient allowance before buys
                txHash = await writeContractAsync({
                    address: targetTokenAddress as `0x${string}`,
                    abi: IERC20ABI.abi,
                    functionName: 'approve',
                    args: [targetContractAddress, parseUnits((state.totalErx * 10).toString(), tokenDecimals)] // Approve 10x required to avoid multi-prompts
                });
            } else {
                // Execute Buy
                if (isE1) {
                  // Buying via Panel contract
                  txHash = await writeContractAsync({
                      address: targetContractAddress as `0x${string}`,
                      abi: PanelABI.abi,
                      functionName: 'buyProduct',
                      args: [item.hash as `0x${string}`] // bytes32 hash of the product
                  });
                } else {
                  // Buying via Store contract
                  txHash = await writeContractAsync({
                      address: targetContractAddress as `0x${string}`,
                      abi: StoreABI.abi,
                      functionName: 'buyProduct',
                      args: [address, item.hash as `0x${string}`] // address user, bytes32 productId
                  });
                }
            }

            // Update UI state with success
            setTxResults(prev => prev.map(res => 
                res.id === item.id 
                ? { ...res, status: 'success', hash: txHash }
                : res
            ));

        } catch (error) {
            console.error(`Failed to buy ${item.name}`, error);
            setTxResults(prev => prev.map(res => 
                res.id === item.id 
                ? { ...res, status: 'failed' }
                : res
            ));
        }
    } catch (e) {
        console.error("Transaction failed:", e);
    } finally {
        setIsProcessing(false);
    }
  }

  if (!state) return <Loader />

  const allDone = txResults.length > 0 && txResults.every(r => r.status !== 'pending');

  const handleBack = () => {
    if (isActivateInvoice) {
      navigate('/Activate', { replace: false })
      return
    }
    navigate(returnPath, { state: { openCart: true, cartItems: (state as { cartItems: ReportItem[] }).cartItems } })
  };

  const handleActivateConfirm = () => {
    if (!state || !('selection' in state)) return
    navigate('/activate/execution', { state })
  };

  const pageTitle = checkoutSource === 'activate' ? 'Invoice' : 'Checkout Invoice';

  const formatInvoiceUsd = (value: number) =>
    isActivateInvoice ? formatUsdSmart(value) : `$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  const formatInvoiceToken = (value: number) =>
    isActivateInvoice ? formatAmountSmart(value) : value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });

  const activateSignatureCount = 2;

  return (
    <>
      <div className="appHeader activate-app-header">
        <div className="left">
          {!isActivateInvoice ? (
            <button
              type="button"
              className="headerButton goBack activate-header-btn"
              onClick={handleBack}
              aria-label="Back"
            >
              <AppIcon icon="lucide:chevron-left" />
            </button>
          ) : null}
        </div>
        <div className="pageTitle">{isActivateInvoice ? '' : pageTitle}</div>
        <div className="right" />
      </div>

      <div
        className={
          isActivateInvoice
            ? 'activate-page-root overflow-x-hidden pb-28'
            : 'relative px-4 pb-28'
        }
      >
        <div
          className={`relative z-10 mx-auto flex w-full flex-col gap-6${
            isActivateInvoice ? ' activate-content-width' : ''
          }`}
        >
          {isActivateInvoice && activateSelection ? (
            <ActivateInvoiceStage
              selection={activateSelection}
              totalSubtotal={state.totalSubtotal}
              totalErx={state.totalErx}
              userBalance={userTokenBalance}
              paymentToken={state.paymentToken}
              invoiceDate={invoiceDate}
              invoiceTime={invoiceTime}
              signatureCount={activateSignatureCount}
              onConfirm={handleActivateConfirm}
              onCancel={() => navigate('/Activate')}
            />
          ) : !isActivateInvoice ? (
            <>
            <div className="mb-2 text-center">
              <p className="text-[15px] font-normal text-brand-surface-muted">
                Review your cart before executing ERX purchases (NFT + E1 cashback).
              </p>
            </div>
          <GlassCard glowColor="blue" className="activate-stage-card w-full">
            <div className="p-7 text-[15px] font-normal">
              <div className="flex items-center justify-between border-b border-gray-200/50 pb-3">
                <span className="text-[#6b7280]">Date</span>
                <span className="text-[#1a1a2e]">{currentDate}</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-200/50 pb-3 pt-3">
                <span className="text-[#6b7280]">Items</span>
                <span className="text-[#1a1a2e]">
                  {`${(state as { cartItems: ReportItem[] }).cartItems?.length ?? 0} items`}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-200/50 pb-3 pt-3">
                <span className="text-[#6b7280]">Package</span>
                <span className="text-[#1a1a2e]">
                  {`${(state as { cartItems: ReportItem[] }).cartItems?.length ?? 0} items`}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-200/50 pb-3 pt-3">
                <span className="text-[#6b7280]">Total USD Value</span>
                <span className="text-[#1a1a2e]">{formatInvoiceUsd(state.totalSubtotal)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-200/50 pb-3 pt-3">
                <span className="text-[#6b7280]">{`${state.paymentToken} Price Oracle`}</span>
                <span className="text-[#1a1a2e]">${state.erxPriceUsd.toFixed(4)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-200/50 pb-3 pt-3">
                <span className="text-[#6b7280]">Your Balance</span>
                <span className="text-[#1a1a2e]">
                  {userTokenBalance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 6,
                  })}{' '}
                  {state.paymentToken}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-200/50 pb-3 pt-3">
                <span className="text-[#6b7280]">Required Execution</span>
                <span className="flex items-center gap-1.5 text-[#1a1a2e]">
                  ~ {formatInvoiceToken(state.totalErx)} {state.paymentToken}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="text-[#6b7280]">Transactions</span>
                <span className="text-[#1a1a2e]">{txQueue.length} Signatures</span>
              </div>
            </div>
          </GlassCard>
            </>
          ) : null}

          {!isActivateInvoice && (
          <GlassCard glowColor="pink">
            <div className="p-6">
            <h3 className="mb-4 text-center text-[15px] font-normal text-brand-surface-dark">Execution Pipeline</h3>
            <div className="flex flex-col gap-3">
              {txResults.map(res => (
                <div key={res.id} className="flex flex-col gap-1.5 rounded-2xl border border-white/50 bg-white/60 p-3.5 shadow-sm">
                  <div className="flex w-full items-center justify-between">
                    <span className="text-[15px] font-normal text-[#1a1a2e]">{res.productName}</span>
                    {res.status === 'pending' && <span className="rounded bg-[#f59e0b]/10 px-2 py-0.5 text-[15px] font-normal uppercase tracking-wide text-[#d97706]">Pending</span>}
                    {res.status === 'success' && <span className="rounded bg-[#10b981]/10 px-2 py-0.5 text-[15px] font-normal uppercase tracking-wide text-[#059669]">Success</span>}
                    {res.status === 'failed' && <span className="rounded bg-[#ef4444]/10 px-2 py-0.5 text-[15px] font-normal uppercase tracking-wide text-[#dc2626]">Failed</span>}
                  </div>
                  {res.hash && (
                    <div className="truncate break-all font-mono text-[15px] font-normal text-[#6b7280]">
                      Tx: {res.hash}
                    </div>
                  )}
                </div>
              ))}
            </div>
            </div>
          </GlassCard>
          )}

          <div className="mt-2 pb-8">
            {isActivateInvoice ? null : allDone ? (
              <button
                type="button"
                className="btn btn-primary btn-block btn-lg activate-continue-btn"
                onClick={() => navigate(returnPath, { replace: true })}
              >
                {checkoutSource === 'activate' ? 'Return to Activate' : 'Return to Store'}
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-block btn-lg activate-continue-btn"
                onClick={handleConfirm}
                disabled={isProcessing}
              >
                {isProcessing ? 'Executing...' : 'Confirm'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
