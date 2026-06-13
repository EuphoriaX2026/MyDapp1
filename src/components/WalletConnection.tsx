import { useEffect, useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useWallet } from '../hooks/useWallet'
import { isMobile, isIOS, isAndroid, getWalletDeepLink, getUserAgentInfo } from '../utils/mobile'

interface WalletConnectionProps {
  onConnect?: () => void
  onDisconnect?: () => void
  showBalance?: boolean
  compact?: boolean
}

export const WalletConnection = ({
  onConnect,
  showBalance = true,
  compact = false
}: WalletConnectionProps) => {
  const {
    isConnected,
    isConnecting,
    openConnectModal,
    getFormattedBalance,
    switchToCurrentNetwork
  } = useWallet()

  const [deviceInfo, setDeviceInfo] = useState<any>({})
  const isMobileDevice = isMobile()

  useEffect(() => {
    setDeviceInfo(getUserAgentInfo())
  }, [])

  useEffect(() => {
    if (isConnected && onConnect) {
      onConnect()
    }
  }, [isConnected, onConnect])

  const handleConnectClick = () => {
    // On mobile devices, provide additional guidance
    if (isMobileDevice) {
      // Check if we're in a mobile wallet's in-app browser
      if (window.ethereum) {
        openConnectModal?.()
      } else {
        // Guide user to install a wallet or open in wallet browser
        showMobileWalletGuide()
      }
    } else {
      openConnectModal?.()
    }
  }

  const showMobileWalletGuide = () => {
    const walletOptions = [
      { name: 'MetaMask', deepLink: getWalletDeepLink('metamask', window.location.href) },
      { name: 'Trust Wallet', deepLink: getWalletDeepLink('trust', window.location.href) },
      { name: 'Coinbase Wallet', deepLink: getWalletDeepLink('coinbase', window.location.href) }
    ]

    // Create mobile-friendly modal or redirect
    const modal = document.createElement('div')
    modal.className = 'mobile-wallet-guide-modal'
    modal.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <h3>Connect Your Wallet</h3>
          <p>Choose how you'd like to connect:</p>
          <div class="wallet-options">
            ${walletOptions.map(wallet => `
              <a href="${wallet.deepLink}" class="wallet-option">
                <span>Open in ${wallet.name}</span>
              </a>
            `).join('')}
            <button onclick="this.closest('.mobile-wallet-guide-modal').remove()" class="close-btn">
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    `
    document.body.appendChild(modal)
  }

  // Mobile wallet guidance function

  if (compact) {
    return (
      <ConnectButton.Custom>
        {({ account, chain, openAccountModal, mounted }) => {
          const ready = mounted
          const connected = ready && account && chain

          return (
            <div
              {...(!ready && {
                'aria-hidden': true,
                style: {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <button
                      onClick={handleConnectClick}
                      className="btn btn-primary btn-sm"
                      disabled={isConnecting}
                    >
                      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                    </button>
                  )
                }

                return (
                  <button
                    onClick={openAccountModal}
                    className="btn btn-outline-primary btn-sm"
                  >
                    {account.displayName}
                  </button>
                )
              })()}
            </div>
          )
        }}
      </ConnectButton.Custom>
    )
  }

  return (
    <div className="wallet-connection">
      <ConnectButton.Custom>
        {({ account, chain, openAccountModal, openChainModal, mounted }) => {
          const ready = mounted
          const connected = ready && account && chain

          return (
            <div
              {...(!ready && {
                'aria-hidden': true,
                style: {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <div className="connect-wallet-container">
                      <button
                        onClick={handleConnectClick}
                        className="btn btn-primary btn-lg btn-block"
                        disabled={isConnecting}
                      >
                        {isConnecting ? (
                          <div className="d-flex align-items-center justify-content-center">
                            <div className="spinner-border spinner-border-sm me-2" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            Connecting...
                          </div>
                        ) : (
                          'Connect Wallet'
                        )}
                      </button>
                      

                    </div>
                  )
                }

                if (chain.unsupported) {
                  return (
                    <div className="unsupported-chain">
                      <button
                        onClick={openChainModal}
                        className="btn btn-warning btn-lg btn-block"
                      >
                        Wrong Network
                      </button>
                      <button
                        onClick={switchToCurrentNetwork}
                        className="btn btn-outline-primary btn-sm mt-2"
                      >
                        Switch to Correct Network
                      </button>
                    </div>
                  )
                }

                return (
                  <div className="connected-wallet">
                    <div className="wallet-info">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <button
                            onClick={openAccountModal}
                            className="btn btn-outline-primary"
                          >
                            {account.displayName}
                          </button>
                        </div>
                        <div>
                          <button
                            onClick={openChainModal}
                            className="btn btn-outline-secondary btn-sm"
                          >
                            {chain.name}
                          </button>
                        </div>
                      </div>
                      
                      {showBalance && (
                        <div className="wallet-balance mt-2">
                          <small className="text-muted">
                            Balance: {getFormattedBalance()}
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })()}
            </div>
          )
        }}
      </ConnectButton.Custom>


    </div>
  )
}