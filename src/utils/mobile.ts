/**
 * Mobile detection and wallet utilities
 */

// Detect if the user is on a mobile device
export const isMobile = (): boolean => {
    if (typeof window === 'undefined') return false

    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    ) || window.innerWidth <= 768
}

// Detect if user is on iOS
export const isIOS = (): boolean => {
    if (typeof window === 'undefined') return false

    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window)
}

// Detect if user is on Android
export const isAndroid = (): boolean => {
    if (typeof window === 'undefined') return false

    return /Android/i.test(navigator.userAgent)
}

// Check if MetaMask mobile app is available
export const isMetaMaskMobileApp = (): boolean => {
    if (typeof window === 'undefined') return false

    return (
        window.ethereum?.isMetaMask &&
        (isIOS() || isAndroid()) &&
        !window.ethereum?.isDesktop
    )
}

// Check if Trust Wallet is available
export const isTrustWallet = (): boolean => {
    if (typeof window === 'undefined') return false

    return window.ethereum?.isTrust || (window as any).trustwallet !== undefined
}

// Check if Coinbase Wallet is available
export const isCoinbaseWallet = (): boolean => {
    if (typeof window === 'undefined') return false

    return window.ethereum?.isCoinbaseWallet || (window as any).coinbaseWalletExtension !== undefined
}

// Generate wallet deep links for mobile
export const getWalletDeepLink = (walletType: string, dappUrl: string): string => {
    const encodedUrl = encodeURIComponent(dappUrl)

    switch (walletType.toLowerCase()) {
        case 'metamask':
            return `https://metamask.app.link/dapp/${dappUrl.replace('https://', '')}`

        case 'trust':
        case 'trustwallet':
            return `trust://open_url?coin_id=60&url=${encodedUrl}`

        case 'coinbase':
            return `https://go.cb-w.com/dapp?cb_url=${encodedUrl}`

        case 'rainbow':
            return `rainbow://open?url=${encodedUrl}`

        default:
            return dappUrl
    }
}

// Check if wallet is installed on mobile
export const isWalletInstalled = (walletType: string): boolean => {
    if (typeof window === 'undefined') return false

    switch (walletType.toLowerCase()) {
        case 'metamask':
            return window.ethereum?.isMetaMask || false

        case 'trust':
        case 'trustwallet':
            return isTrustWallet()

        case 'coinbase':
            return isCoinbaseWallet()

        default:
            return false
    }
}

// Get user agent info for debugging
export const getUserAgentInfo = () => {
    if (typeof window === 'undefined') return {}

    return {
        userAgent: navigator.userAgent,
        isMobile: isMobile(),
        isIOS: isIOS(),
        isAndroid: isAndroid(),
        isMetaMaskMobile: isMetaMaskMobileApp(),
        isTrustWallet: isTrustWallet(),
        isCoinbaseWallet: isCoinbaseWallet(),
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
    }
}


// detectWalletEnvironment remains for some internal detection logic if needed
export const detectWalletEnvironment = () => {
    if (typeof window === 'undefined') return { environment: 'server', wallets: [] }

    const detectedWallets = []
    const environment = isMobile() ? 'mobile' : 'desktop'

    // Check for injected wallets
    if (window.ethereum) {
        if (window.ethereum.isMetaMask) detectedWallets.push('MetaMask')
        if (window.ethereum.isTrust) detectedWallets.push('Trust Wallet')
        if (window.ethereum.isCoinbaseWallet) detectedWallets.push('Coinbase Wallet')
        if (window.ethereum.isBraveWallet) detectedWallets.push('Brave Wallet')
        if (window.ethereum.isRabby) detectedWallets.push('Rabby')
    }

    // Check for mobile app browsers
    if (isMobile()) {
        const userAgent = navigator.userAgent.toLowerCase()
        if (userAgent.includes('trustwallet')) detectedWallets.push('Trust Wallet App Browser')
        if (userAgent.includes('metamask')) detectedWallets.push('MetaMask App Browser')
        if (userAgent.includes('coinbase')) detectedWallets.push('Coinbase Wallet App Browser')
    }

    return {
        environment,
        wallets: [...new Set(detectedWallets)], // Remove duplicates
        hasInjectedWallet: !!window.ethereum,
        isWalletBrowser: detectedWallets.some(w => w.includes('App Browser'))
    }
}
