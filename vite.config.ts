import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Default `npm run dev` → HTTP (desktop + BlueStacks). Use `npm run dev:https` for PWA install testing.
  const useHttps = mode === 'https'

  return {
  base: './',
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    ...(useHttps
      ? {
          hmr: {
            protocol: 'wss',
            clientPort: 5173,
          },
        }
      : {}),
  },
  plugins: [
    ...(useHttps ? [basicSsl()] : []),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: {
        // Only register SW in dev when HTTPS mode is active (secure context).
        enabled: useHttps,
        type: 'module',
        navigateFallback: 'index.html',
      },
      includeAssets: ['favicon.ico', 'loader-logo-color.png', 'pwa.png'],
      manifest: {
        id: '/',
        name: 'E.ONE',
        short_name: 'E.ONE',
        description: 'Decentralized organization',
        theme_color: '#F8F9FE',
        background_color: '#F8F9FE',
        display: 'standalone',
        orientation: 'portrait',
        scope: './',
        start_url: './',
        icons: [
          {
            src: 'pwa.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        maximumFileSizeToCacheInBytes: 4000000,
      },
    }),
  ],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      process: 'process/browser',
      buffer: 'buffer',
      util: 'util',
      '@react-native-async-storage/async-storage': path.resolve(
        __dirname,
        './src/utils/mock-async-storage.ts',
      ),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['import', 'global-builtin', 'color-functions'],
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          router: ['react-router-dom'],
          'web3-vendor': ['ethers', 'viem', 'wagmi', '@rainbow-me/rainbowkit'],
          'ui-vendor': ['@ionic/react', '@iconify/react', 'bootstrap'],
          charts: ['apexcharts'],
          'utils-vendor': ['@tanstack/react-query', '@splidejs/splide', 'clsx'],
        },
      },
    },
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
  },
  }
})
