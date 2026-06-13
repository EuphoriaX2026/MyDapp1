import { type ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '../config/wagmi'
import { WalletSessionSync } from '../components/WalletSessionSync'
import { WalletRegistrationProvider } from '../context/WalletRegistrationContext'
import '@rainbow-me/rainbowkit/styles.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (replaces deprecated cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
      // Disable legacy behavior that might cause warnings
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
})

interface ProvidersProps {
  children: ReactNode
}

const getTheme = () => {
  const baseTheme = {
    accentColor: '#DB2CF5', // Brand Pastel Pink
    accentColorForeground: '#ffffff',
    borderRadius: 'large' as const,
    fontStack: 'system' as const,
    overlayBlur: 'large' as const,
  }

  const theme = lightTheme(baseTheme);

  // App shell: readable solid modal + Inter body font
  theme.colors.modalBackground = '#ffffff';
  theme.colors.modalText = '#1a1a2e';
  theme.fonts.body = `'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif`;

  return theme;
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WalletSessionSync />
        <WalletRegistrationProvider>
        <RainbowKitProvider
          theme={getTheme()}
          showRecentTransactions={true}
          modalSize="compact"
          appInfo={{
            appName: 'E1',
            learnMoreUrl: 'https://e.one',
            disclaimer: ({ Text, Link }) => (
              <Text>
                By connecting your wallet, you agree to our{' '}
                <Link href="https://e.one/terms">Terms of Service</Link> and{' '}
                <Link href="https://e.one/privacy">Privacy Policy</Link>.
              </Text>
            ),
          }}
          coolMode={false}
          locale="en-US"
        >
          {children}
        </RainbowKitProvider>
        </WalletRegistrationProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
