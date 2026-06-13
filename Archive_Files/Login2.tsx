import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader } from '../components/Loader'
import { useAccount, useReadContract } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { TITAN_CONTRACTS } from '../config/my-titan-contracts'
import RegisterABI from '../abis/Register-titan.json'
import { useWallet } from '../hooks/useWallet'
import { isMobile } from '../utils/mobile'
import '../styles/mobile-wallet.css'

export const Login2 = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [intendedRoute, setIntendedRoute] = useState<string>('/')
  const navigate = useNavigate()
  const { isConnected, address } = useAccount()
  const { openConnectModal } = useConnectModal()
  const { isConnecting } = useWallet()

  const registerAddress = TITAN_CONTRACTS.Register

  // Read User validity
  const { data: isRegistered, isFetched } = useReadContract({
    address: registerAddress as `0x${string}`,
    abi: RegisterABI.abi,
    functionName: 'isUserAddressRegistered',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  })

  // Auto-redirect logic
  useEffect(() => {
    if (isConnected && !isConnecting && isFetched) {
      if (isRegistered) {
        setIsLoading(true)
        setTimeout(() => {
          // If registered, force redirect to Dashboard (or intended route if not root)
          navigate(intendedRoute === '/register' ? '/' : intendedRoute, { replace: true })
        }, 1500)
      } else {
        // If not registered but they clicked Register specifically, send them to Register page
        if (intendedRoute === '/register') {
          navigate('/register')
        }
        // Otherwise they stay on the Login page to see the highlighted Register button
      }
    }
  }, [isConnected, isConnecting, isRegistered, isFetched, navigate, intendedRoute])

  const handleRegisterClick = () => {
    if (!isConnected) return;
    if (isFetched && isRegistered) return;
    navigate('/register')
  }

  const handleConnectWallet = () => {
    setIntendedRoute('/');
    openConnectModal?.();
  }

  if (isLoading || (isConnected && isConnecting)) {
    return <Loader />
  }

  const enhancedStyles = `
    .unified-gateway {
      position: relative;
      min-height: 100vh;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: #F8F9FE;
      color: #1C1C1E;
      font-family: 'Inter', sans-serif;
    }

    .glow-unified {
      position: absolute;
      top: -10%; right: -10%;
      width: 400px; height: 400px;
      background: #6B46FF;
      border-radius: 50%;
      mix-blend-mode: multiply;
      filter: blur(120px);
      opacity: 0.1;
      pointer-events: none;
    }

    .unified-stack {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      padding: 0 24px;
      margin-top: -40px;
    }

    .branding-unified {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 40px;
    }

    .brand-title-italic {
      color: #1C1C1E;
      font-size: 42px; 
      font-weight: 800;
      letter-spacing: -1px; 
      line-height: 1;
      margin: 0; 
      margin-bottom: 8px;
      font-style: italic;
      transform: skewX(-5deg);
      display: inline-block;
    }

    .brand-subtitle-unified {
      color: #8E8E93;
      font-size: 11px; font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      margin: 0;
    }

    .action-card-unified {
      width: 100%;
      max-width: 340px;
      background: rgba(255, 255, 255, 0.4);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-radius: 24px;
      padding: 24px;
      box-shadow: 0 12px 24px -6px rgba(74, 37, 225, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.3);
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* REALMS STYLE BUTTON (Connect Wallet) */
    .btn-realms-style {
      width: 100%; height: 58px;
      border-radius: 18px;
      background: linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%);
      color: white;
      font-weight: 700; font-size: 16px;
      display: flex; justify-content: center; align-items: center;
      border: none; 
      cursor: pointer;
      box-shadow: 0 8px 16px rgba(74, 0, 224, 0.4);
      position: relative;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .btn-realms-style:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 20px rgba(74, 0, 224, 0.5);
    }

    /* SILVER STYLE BUTTON (Create Account) */
    .btn-silver-style {
      width: 100%; height: 58px;
      border-radius: 18px;
      background: linear-gradient(135deg, #bdc3c7 0%, #7f8c8d 100%);
      color: white;
      font-weight: 700; font-size: 16px;
      display: flex; justify-content: center; align-items: center;
      border: none;
      cursor: pointer;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      position: relative;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .btn-silver-style:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
    }

    .security-footer-unified {
      margin-top: 32px;
      display: flex; align-items: center; gap: 8px;
      color: #A1A1AA;
    }
    .security-footer-unified svg { width: 16px; height: 16px; }
    .security-footer-unified span {
      font-size: 11px; font-weight: 500;
      letter-spacing: 0.1em; text-transform: uppercase;
    }
  `;

  return (
    <div className="unified-gateway">
      <style>{enhancedStyles}</style>

      {/* 1. Subtle Background Glow */}
      <div className="glow-unified"></div>

      {/* 2. Content Stack */}
      <div className="unified-stack">
        
        {/* Branding Section */}
        <div className="branding-unified">
          <h1 className="brand-title-italic">E.ONE</h1>
          <p className="brand-subtitle-unified">Decentralized organization</p>
        </div>

        {/* Action Card */}
        <div className="action-card-unified">
          {!isConnected ? (
            <button 
              className="btn-realms-style" 
              onClick={handleConnectWallet}
            >
              Connect Wallet
            </button>
          ) : isFetched && isRegistered ? (
            <button className="btn-realms-style" onClick={() => navigate('/')}>
              ENTER DASHBOARD
            </button>
          ) : (
            <button className="btn-realms-style" onClick={() => navigate('/')}>
              CONNECTED ACCOUNT
            </button>
          )}

          <button 
            className="btn-silver-style"
            onClick={handleRegisterClick}
          >
            Register Now
          </button>
        </div>

        {/* Security Footer */}
        <div className="security-footer-unified">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
          <span>Bank-Grade Security</span>
        </div>
      </div>
    </div>
  )
}
