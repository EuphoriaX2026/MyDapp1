import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { setupIonicReact } from '@ionic/react'
import App from './App.tsx'
import './styles/bootstrap-loader.css'
import './index.css'
import './styles/fonts.css'
import './styles/app-typography.css'
import './styles/tailwind.css'
import './styles/finapp-app-theme.css'
import './styles/eone-sidebar.css'
import { Providers } from './providers'
import './utils/errorTracker' // Global error tracking
import './utils/suppressWarnings' // Suppress known deprecation warnings
import { getThemePathname, syncFinappTheme } from './utils/finappThemeSync'
import { appLogo, favicon, loadingIcon } from './assets/media'

function applyBootstrapAssets() {
  let iconLink = document.querySelector("link[rel='icon']") as HTMLLinkElement | null
  if (!iconLink) {
    iconLink = document.createElement('link')
    iconLink.rel = 'icon'
    iconLink.type = 'image/png'
    document.head.appendChild(iconLink)
  }
  iconLink.href = favicon

  const loaderLight = document.querySelector(
    '#bootstrap-loader .loading-icon--light',
  ) as HTMLImageElement | null
  const loaderDark = document.querySelector(
    '#bootstrap-loader .loading-icon--dark',
  ) as HTMLImageElement | null
  if (loaderLight) loaderLight.src = loadingIcon
  if (loaderDark) loaderDark.src = appLogo
}

syncFinappTheme(getThemePathname())
applyBootstrapAssets()

// Import Bootstrap JavaScript and make it globally available
import * as bootstrap from 'bootstrap'
// Make Bootstrap available globally for tooltip initialization
;(window as any).bootstrap = bootstrap

// Import Splide for carousels
import { Splide } from '@splidejs/splide'
// Make Splide available globally
window.Splide = Splide

setupIonicReact()

const hideBootstrapLoader = () => {
  const el = document.getElementById('bootstrap-loader')
  if (el) {
    el.style.pointerEvents = 'none'
    el.style.opacity = '0'
    el.style.display = 'none'
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
)

hideBootstrapLoader()
