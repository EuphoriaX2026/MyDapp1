import { AppIcon } from './icons/AppIcon';
import { useState, useEffect } from 'react';


import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits, parseGwei } from 'viem';
import { useNavigate } from 'react-router-dom';

// Hooks & Configs
import { useEuphoriaExchange } from '../hooks/useEuphoriaExchange';
import { useTransferFeeQuote } from '../hooks/useTransferFeeQuote';
import { ERX_CONTRACTS, TOKENS } from '../config/erx-contracts';
import { EGuardPenaltyBanner } from './ui/EGuardPenaltyBanner';
import {
  sanitizeWalletAddressInput,
  validateWalletAddress,
} from '../utils/addressValidation';

// ABIs
import EConfigsABI from '../abis/econfigs.json';
import ERXTokenABI from '../abis/erx-token.json';

export const SendActionSheet = () => {
    const { address } = useAccount();
    const navigate = useNavigate();
    
    // State
    const [sendToAddress, setSendToAddress] = useState('');
    const [sendAmount, setSendAmount] = useState('');
    const [selectedToken, setSelectedToken] = useState('ERX');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [step, setStep] = useState<'INPUT' | 'REVIEW'>('INPUT');

    // Token Configuration
    const TOKEN_SETTINGS: Record<string, { symbol: string, address: string, feePercent: number | 'dynamic', price: number | 'dynamic', decimals: number }> = {
        'ERX': { symbol: 'ERX', address: ERX_CONTRACTS.ERX, feePercent: 'dynamic', price: 'dynamic', decimals: 18 },
        'E1': { symbol: 'E1', address: TOKENS.USDT, feePercent: 2.5, price: 1.0, decimals: 6 },
        'DAI': { symbol: 'DAI', address: TOKENS.DAI, feePercent: 1.0, price: 1.0, decimals: 18 }
    };

    const { currentPrice: currentERXPrice } = useEuphoriaExchange();
    const config = TOKEN_SETTINGS[selectedToken];

    const { isPenalized } = useTransferFeeQuote({
        tokenSymbol: config.symbol,
        amount: sendAmount,
        senderAddress: address,
    });

    // 1. Get Fee Rates
    const { data: feeRates } = useReadContract({
        address: ERX_CONTRACTS.EConfigs as `0x${string}`,
        abi: (EConfigsABI as any).abi || EConfigsABI,
        functionName: 'getFeeRates',
        args: [0n, 2], // category 0, direction 2 (transfer)
    }) as { data: [bigint, bigint] | undefined };

    const totalFeeBPS = feeRates ? Number(feeRates[0] + feeRates[1]) / 1e14 : 700;
    const feePercentage = totalFeeBPS / 100;

    // Submit Transaction
    const { data: hash, isPending, writeContractAsync } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    // Clear form on success
    useEffect(() => {
        if (isConfirmed) {
            setSendAmount('');
            setSendToAddress('');
            setStep('INPUT');
            setErrorMessage(null);
            
            // Close modal (Bootstrap way)
            const dismissBtn = document.querySelector('#sendActionSheet .btn-close') as HTMLElement;
            if (dismissBtn) dismissBtn.click();
        }
    }, [isConfirmed]);

    const handleNextStep = () => {
        const validation = validateWalletAddress(sendToAddress);
        if (!validation.isValid) {
            setErrorMessage(validation.error ?? 'Invalid wallet address.');
            return;
        }
        if (!sendToAddress || !sendAmount) return;
        setErrorMessage(null);
        setStep('REVIEW');
    };

    const handleConfirmSend = async () => {
        if (!sendToAddress || !sendAmount) return;
        setErrorMessage(null);
        
        const config = TOKEN_SETTINGS[selectedToken];
        
        try {
            const hash = await writeContractAsync({
                address: config.address as `0x${string}`,
                abi: (ERXTokenABI as any).abi || ERXTokenABI,
                functionName: 'transfer',
                args: [sendToAddress as `0x${string}`, parseUnits(sendAmount, config.decimals)],
                maxPriorityFeePerGas: parseGwei('30'), 
                maxFeePerGas: parseGwei('50'), 
            });
            
            // Fix for "sticky overlay"
            document.body.classList.remove('modal-open');
            const backdrops = document.getElementsByClassName('modal-backdrop');
            while (backdrops[0]) {
                backdrops[0].parentNode?.removeChild(backdrops[0]);
            }

            navigate(`/transaction/${hash}`, { 
                state: { 
                    type: 'transfer',
                    amount: sendAmount,
                    token: config.symbol,
                    to: sendToAddress,
                    date: new Date().toISOString()
                } 
            });
            
        } catch (e: any) {
            console.error("Transfer failed", e);
            setErrorMessage(e.message || "Transaction failed. Please check your balance and try again.");
        }
    };

    // Calculations
    const amountNum = parseFloat(sendAmount) || 0;
    
    let currentFeePercentage = 0;
    if (config.feePercent === 'dynamic') {
       currentFeePercentage = feePercentage;
    } else {
       currentFeePercentage = config.feePercent;
    }
  
    let activeTokenPrice = 0;
    if (config.price === 'dynamic') {
        activeTokenPrice = currentERXPrice;
    } else {
        activeTokenPrice = config.price;
    }
  
    const feeValue = amountNum * (currentFeePercentage / 100);
    const receiveValue = amountNum - feeValue;
  
    const formatNumber = (num: number) => {
      if (num === 0) return '0';
      return parseFloat(num.toFixed(4)).toString();
    };

    return (
        <div className="modal fade action-sheet" id="sendActionSheet" tabIndex={-1} role="dialog">
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Send Money</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div className="action-sheet-content">
                            <form>
                                <div className="form-group basic">
                                    <div className="input-wrapper">
                                        <label className="label" htmlFor="tokenSelect">Select Token</label>
                                        <select 
                                            className="form-control custom-select" 
                                            id="tokenSelect"
                                            value={selectedToken}
                                            onChange={(e) => setSelectedToken(e.target.value)}
                                            disabled={step === 'REVIEW'}
                                        >
                                            {Object.keys(TOKEN_SETTINGS).map((key) => (
                                                <option key={key} value={key}>
                                                    {TOKEN_SETTINGS[key].symbol}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group basic">
                                    <div className="input-wrapper">
                                        <label className="label" htmlFor="sendToAddress">Enter Wallet address</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            id="sendToAddress" 
                                            placeholder="0x..." 
                                            value={sendToAddress}
                                            onChange={(e) => setSendToAddress(sanitizeWalletAddressInput(e.target.value))}
                                            readOnly={step === 'REVIEW'}
                                        />
                                        <i className="clear-input">
                                            <AppIcon icon="lucide:x" onClick={() => setSendToAddress('')}/>
                                        </i>
                                    </div>
                                </div>

                                <div className="form-group basic">
                                    <label className="label">Enter Amount</label>
                                    <div className="input-group mb-2">
                                        <input 
                                            type="number" 
                                            className="form-control" 
                                            placeholder="0" 
                                            value={sendAmount}
                                            onChange={(e) => setSendAmount(e.target.value)}
                                            style={{
                                               appearance: 'textfield',
                                               MozAppearance: 'textfield' 
                                            }}
                                            readOnly={step === 'REVIEW'}
                                        />
                                    </div>
                                </div>

                                <div className="form-group basic">
                                    <label className="label">Fee ({currentFeePercentage}%)</label>
                                    <div className="input-group mb-2">
                                        <input 
                                            type="text" 
                                            className="form-control text-muted" 
                                            value={formatNumber(feeValue)} 
                                            readOnly
                                        />
                                    </div>
                                </div>

                                <div className="form-group basic">
                                    <label className="label">Receive Amount</label>
                                    <div className="input-group mb-2">
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={formatNumber(receiveValue)} 
                                            readOnly 
                                            style={{ fontWeight: 'bold' }}
                                        />
                                    </div>
                                     {receiveValue > 0 && activeTokenPrice > 0 && (
                                        <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                                            ≈ ${(receiveValue * activeTokenPrice).toFixed(2)} USD
                                        </div>
                                    )}
                                </div>

                                {errorMessage && <div className="alert alert-danger mt-2">{errorMessage}</div>}
                                {isPending && <div className="alert alert-warning mt-2">Check your wallet...</div>}
                                {isConfirming && <div className="alert alert-info mt-2">Confirming transaction...</div>}
                                {isConfirmed && <div className="alert alert-success mt-2">Transfer Successful!</div>}

                                <EGuardPenaltyBanner isVisible={isPenalized} />

                                <div className="form-group basic">
                                    {step === 'INPUT' ? (
                                        <button 
                                            type="button" 
                                            className="btn btn-primary btn-block btn-lg" 
                                            onClick={handleNextStep}
                                            disabled={!sendToAddress || !sendAmount}
                                        >
                                            Verify
                                        </button>
                                    ) : (
                                        <div className="row">
                                            <div className="col-6">
                                                <button 
                                                    type="button" 
                                                    className="btn btn-outline-secondary btn-block btn-lg" 
                                                    onClick={() => setStep('INPUT')}
                                                    disabled={isPending || isConfirming}
                                                >
                                                    Back
                                                </button>
                                            </div>
                                            <div className="col-6">
                                                <button 
                                                    type="button" 
                                                    className="btn btn-primary btn-block btn-lg" 
                                                    onClick={handleConfirmSend}
                                                    disabled={isPending || isConfirming}
                                                >
                                                    {isPending ? 'Sending...' : 'Confirm Transaction'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
