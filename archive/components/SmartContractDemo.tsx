import { useState } from 'react'
import { IonIcon } from '@ionic/react'
import { swapHorizontalOutline, walletOutline, trendingUpOutline } from 'ionicons/icons'
import { useWallet } from '../hooks/useWallet'
import { useContractInteraction } from '../hooks/useContractInteraction'
import { useDEXOperations } from '../hooks/useDEXOperations'
import { useTokenApproval } from '../hooks/useTokenApproval'
import { useStaking } from '../hooks/useStaking'
import { contracts } from '../config/wagmi'

export const SmartContractDemo = () => {
  const [activeTab, setActiveTab] = useState<'swap' | 'stake' | 'transfer'>('swap')
  const [swapAmount, setSwapAmount] = useState('')
  const [stakeAmount, setStakeAmount] = useState('')
  const [transferAmount, setTransferAmount] = useState('')
  const [transferTo, setTransferTo] = useState('')

  // Wallet connection
  const { 
    address, 
    isConnected, 
    getFormattedBalance,
    openConnectModal 
  } = useWallet()

  // Contract interactions
  const { 
    useTokenBalance,
    transferToken,
    formatTokenAmount,
    isPending: isTransferPending,
    isConfirmed: isTransferConfirmed,
    error: transferError
  } = useContractInteraction()

  // DEX operations
  const {
    useSwapQuote,
    swapTokens,
    calculateSlippage,
    isPending: isSwapPending,
    isConfirmed: isSwapConfirmed,
    error: swapError
  } = useDEXOperations()

  // Staking
  const {
    useStakedBalance,
    useEarnedRewards,
    stakeTokens,
    claimRewards,
    isPending: isStakePending,
    isConfirmed: isStakeConfirmed,
    error: stakeError
  } = useStaking()

  // Token approvals
  const {
    useApprovalStatus,
    approveForDEX,
    approveForStaking,
    isPending: isApprovePending,
    // isConfirmed: isApproveConfirmed
  } = useTokenApproval()

  // Get token balances
  const { data: erxBalance } = useTokenBalance(contracts.ERX_TOKEN)
  const { data: usdcBalance } = useTokenBalance(contracts.USDC ? contracts.USDC as `0x${string}` : '0x0000000000000000000000000000000000000000')
  
  // Get staking data
  const { data: stakedERX } = useStakedBalance(contracts.ERX_STAKING_POOL || '0x0000000000000000000000000000000000000000')
  const { data: earnedRewards } = useEarnedRewards(contracts.ERX_STAKING_POOL || '0x0000000000000000000000000000000000000000')
  
  // Get swap quote
  const { data: swapQuote } = useSwapQuote(swapAmount, contracts.ERX_TOKEN, contracts.USDC ? contracts.USDC as `0x${string}` : '0x0000000000000000000000000000000000000000')
  
  // Get approval status for DEX
  const { needsApproval: needsDEXApproval } = useApprovalStatus(
    contracts.ERX_TOKEN,
    contracts.SWAP_ROUTER
  )
  
  // Get approval status for staking
  const { needsApproval: needsStakingApproval } = useApprovalStatus(
    contracts.ERX_TOKEN,
    contracts.ERX_STAKING_POOL || '0x0000000000000000000000000000000000000000'
  )

  // Handle swap
  const handleSwap = async () => {
    if (!isConnected || !swapAmount) return

    try {
      // Check if approval is needed
      if (needsDEXApproval(swapAmount)) {
        await approveForDEX(contracts.ERX_TOKEN, swapAmount)
        return // Wait for approval confirmation
      }

      // Calculate minimum output with 5% slippage
      const expectedOutput = swapQuote?.[1] ? formatTokenAmount(swapQuote[1], contracts.USDC || '0x0') : '0'
      const minOutput = calculateSlippage(expectedOutput, 5)

      await swapTokens({
        tokenIn: contracts.ERX_TOKEN,
        tokenOut: contracts.USDC ? contracts.USDC as `0x${string}` : '0x0000000000000000000000000000000000000000',
        amountIn: swapAmount,
        amountOutMin: minOutput,
        slippageTolerance: 5
      })
    } catch (error) {
      console.error('Swap failed:', error)
    }
  }

  // Handle staking
  const handleStake = async () => {
    if (!isConnected || !stakeAmount) return

    try {
      // Check if approval is needed
      if (needsStakingApproval(stakeAmount)) {
        await approveForStaking(contracts.ERX_TOKEN, stakeAmount)
        return // Wait for approval confirmation
      }

      // await stakeTokens(contracts.ERX_STAKING_POOL, stakeAmount)
    } catch (error) {
      console.error('Staking failed:', error)
    }
  }

  // Handle transfer
  const handleTransfer = async () => {
    if (!isConnected || !transferAmount || !transferTo) return

    try {
      await transferToken(contracts.ERX_TOKEN, transferTo as any, transferAmount)
    } catch (error) {
      console.error('Transfer failed:', error)
    }
  }

  // Handle claim rewards
  const handleClaimRewards = async () => {
    if (!isConnected) return

    try {
      // await claimRewards(contracts.ERX_STAKING_POOL)
    } catch (error) {
      console.error('Claim failed:', error)
    }
  }

  if (!isConnected) {
    return (
      <div className="section mt-4">
        <div className="card">
          <div className="card-body text-center">
            <IonIcon icon={walletOutline} className="mb-3" style={{ fontSize: '48px' }} />
            <h4>Connect Your Wallet</h4>
            <p>Connect your wallet to interact with smart contracts</p>
            <button 
              className="btn btn-primary"
              onClick={openConnectModal}
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="section mt-4">
      {/* Wallet Info */}
      <div className="card mb-3">
        <div className="card-body">
          <h6>Wallet Connected</h6>
          <p className="mb-1">Address: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
          <p className="mb-1">MATIC: {getFormattedBalance()}</p>
          <p className="mb-1">ERX: {erxBalance ? formatTokenAmount(erxBalance, contracts.ERX_TOKEN) : '0'}</p>
          <p className="mb-0">USDC: {usdcBalance ? formatTokenAmount(usdcBalance, contracts.USDC || '0x0000000000000000000000000000000000000000') : '0'}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="section">
        <ul className="nav nav-tabs lined">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'swap' ? 'active' : ''}`}
              onClick={() => setActiveTab('swap')}
            >
              <IonIcon icon={swapHorizontalOutline} />
              Swap
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'stake' ? 'active' : ''}`}
              onClick={() => setActiveTab('stake')}
            >
              <IonIcon icon={trendingUpOutline} />
              Stake
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'transfer' ? 'active' : ''}`}
              onClick={() => setActiveTab('transfer')}
            >
              <IonIcon icon={walletOutline} />
              Transfer
            </button>
          </li>
        </ul>
      </div>

      {/* Swap Tab */}
      {activeTab === 'swap' && (
        <div className="card">
          <div className="card-body">
            <h6>Swap ERX to USDC</h6>
            
            <div className="form-group">
              <label>Amount to Swap</label>
              <input
                type="number"
                className="form-control"
                value={swapAmount}
                onChange={(e) => setSwapAmount(e.target.value)}
                placeholder="Enter ERX amount"
              />
            </div>

            {swapQuote && swapAmount && (
              <div className="alert alert-info">
                Expected output: {formatTokenAmount(swapQuote[1] || BigInt(0), contracts.USDC || '0x0000000000000000000000000000000000000000')} USDC
              </div>
            )}

            {needsDEXApproval(swapAmount) && (
              <div className="alert alert-warning">
                You need to approve ERX spending first
              </div>
            )}

            <button
              className="btn btn-primary btn-block"
              onClick={handleSwap}
              disabled={isSwapPending || isApprovePending || !swapAmount}
            >
              {isSwapPending || isApprovePending ? 'Processing...' : 
               needsDEXApproval(swapAmount) ? 'Approve ERX' : 'Swap Tokens'}
            </button>

            {swapError && (
              <div className="alert alert-danger mt-2">
                Error: {swapError.message}
              </div>
            )}

            {isSwapConfirmed && (
              <div className="alert alert-success mt-2">
                Swap completed successfully!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Staking Tab */}
      {activeTab === 'stake' && (
        <div className="card">
          <div className="card-body">
            <h6>ERX Staking Pool</h6>
            
            <div className="row mb-3">
              <div className="col-6">
                <small>Staked</small>
                <div>{stakedERX ? formatTokenAmount(stakedERX, contracts.ERX_TOKEN) : '0'} ERX</div>
              </div>
              <div className="col-6">
                <small>Rewards</small>
                <div>{earnedRewards ? formatTokenAmount(earnedRewards, contracts.ERX_TOKEN) : '0'} ERX</div>
              </div>
            </div>

            <div className="form-group">
              <label>Amount to Stake</label>
              <input
                type="number"
                className="form-control"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="Enter ERX amount"
              />
            </div>

            {needsStakingApproval(stakeAmount) && (
              <div className="alert alert-warning">
                You need to approve ERX for staking first
              </div>
            )}

            <div className="row">
              <div className="col-6">
                <button
                  className="btn btn-primary btn-block"
                  onClick={handleStake}
                  disabled={isStakePending || isApprovePending || !stakeAmount}
                >
                  {isStakePending || isApprovePending ? 'Processing...' : 
                   needsStakingApproval(stakeAmount) ? 'Approve' : 'Stake'}
                </button>
              </div>
              <div className="col-6">
                <button
                  className="btn btn-outline-primary btn-block"
                  onClick={handleClaimRewards}
                  disabled={isStakePending || !earnedRewards || earnedRewards === BigInt(0)}
                >
                  Claim Rewards
                </button>
              </div>
            </div>

            {stakeError && (
              <div className="alert alert-danger mt-2">
                Error: {stakeError.message}
              </div>
            )}

            {isStakeConfirmed && (
              <div className="alert alert-success mt-2">
                Operation completed successfully!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transfer Tab */}
      {activeTab === 'transfer' && (
        <div className="card">
          <div className="card-body">
            <h6>Transfer ERX Tokens</h6>
            
            <div className="form-group">
              <label>Recipient Address</label>
              <input
                type="text"
                className="form-control"
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                placeholder="0x..."
              />
            </div>

            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                className="form-control"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="Enter ERX amount"
              />
            </div>

            <button
              className="btn btn-primary btn-block"
              onClick={handleTransfer}
              disabled={isTransferPending || !transferAmount || !transferTo}
            >
              {isTransferPending ? 'Processing...' : 'Transfer Tokens'}
            </button>

            {transferError && (
              <div className="alert alert-danger mt-2">
                Error: {transferError.message}
              </div>
            )}

            {isTransferConfirmed && (
              <div className="alert alert-success mt-2">
                Transfer completed successfully!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
