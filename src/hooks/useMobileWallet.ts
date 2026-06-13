import { useState, useEffect } from 'react'
import {
    isMobile,
    isIOS,
    isAndroid,
    detectWalletEnvironment
} from '../utils/mobile'
import { useWallet } from './useWallet'

export interface MobileWalletDetection {
    isMobile: boolean
    isIOS: boolean
    isAndroid: boolean
    environment: 'mobile' | 'desktop' | 'server'
    detectedWallets: string[]
    hasInjectedWallet: boolean
    isWalletBrowser: boolean
    supportedWallets: string[]
    recommendedConnection: 'deeplink' | 'walletconnect' | 'injected'
}

export const useMobileWallet = (): MobileWalletDetection => {
    const [detection, setDetection] = useState<MobileWalletDetection>({
        isMobile: false,
        isIOS: false,
        isAndroid: false,
        environment: 'server',
        detectedWallets: [],
        hasInjectedWallet: false,
        isWalletBrowser: false,
        supportedWallets: [],
        recommendedConnection: 'injected'
    })

    useEffect(() => {
        if (typeof window === 'undefined') return

        const walletEnv = detectWalletEnvironment()
        const mobileDevice = isMobile()
        const iosDevice = isIOS()
        const androidDevice = isAndroid()

        // Define supported wallets based on platform
        const supportedWallets = ['MetaMask', 'Trust Wallet', 'Coinbase Wallet', 'WalletConnect']

        // Determine recommended connection method
        let recommendedConnection: 'deeplink' | 'walletconnect' | 'injected' = 'injected'

        if (mobileDevice) {
            if (walletEnv.hasInjectedWallet && walletEnv.isWalletBrowser) {
                recommendedConnection = 'injected'
            } else if (walletEnv.wallets && walletEnv.wallets.length > 0) {
                recommendedConnection = 'deeplink'
            } else {
                recommendedConnection = 'walletconnect'
            }
        }

        setDetection({
            isMobile: mobileDevice,
            isIOS: iosDevice,
            isAndroid: androidDevice,
            environment: walletEnv.environment as 'mobile' | 'desktop' | 'server',
            detectedWallets: walletEnv.wallets || [],
            hasInjectedWallet: walletEnv.hasInjectedWallet || false,
            isWalletBrowser: walletEnv.isWalletBrowser || false,
            supportedWallets,
            recommendedConnection
        })
    }, [])

    return detection
}

// Additional hook for wallet compatibility checking
export const useWalletCompatibility = () => {
    const [compatibility, setCompatibility] = useState({
        isCompatible: true, // Start as compatible to prevent flash
        reasons: [] as string[],
        recommendations: [] as string[],
        isChecking: true // Add checking state
    })

    useEffect(() => {
        const checkCompatibility = () => {
            const reasons: string[] = []
            const recommendations: string[] = []
            let isCompatible = true

            // Check for basic browser compatibility
            if (typeof window === 'undefined') {
                isCompatible = false
                reasons.push('Server-side environment detected')
                return { isCompatible, reasons, recommendations }
            }

            // Web Crypto — required on desktop; on mobile emulators WalletConnect may still work
            if (!window.crypto || !window.crypto.subtle) {
                if (isMobile()) {
                    recommendations.push(
                        'Limited Web Crypto in this mobile browser. Use Chrome in BlueStacks, or open the site inside SafePal / Trust Wallet browser for signing.',
                    );
                } else {
                    isCompatible = false;
                    reasons.push('Browser does not support Web Crypto API');
                    recommendations.push('Please use a modern browser like Chrome, Firefox, or Safari');
                }
            }

            // Check for local storage
            try {
                localStorage.setItem('test', 'test')
                localStorage.removeItem('test')
            } catch (e) {
                reasons.push('Local storage is not available')
                recommendations.push('Please enable local storage in your browser')
            }

            // Mobile-specific checks
            if (isMobile()) {
                if (isIOS()) {
                    // Check iOS version (WalletConnect requires iOS 13+)
                    const version = navigator.userAgent.match(/OS (\d+)_/)?.[1]
                    if (version && parseInt(version) < 13) {
                        reasons.push('iOS version is too old')
                        recommendations.push('Please update to iOS 13 or later')
                    }
                }

                // Check if in iframe (some wallets don't work in iframes)
                if (window !== window.top) {
                    reasons.push('Application is running in an iframe')
                    recommendations.push('Please open the application in a new tab')
                }
            }

            setCompatibility({ isCompatible, reasons, recommendations, isChecking: false })
        }

        checkCompatibility()
    }, [])

    return compatibility
}
