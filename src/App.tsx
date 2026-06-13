// src/App.tsx

import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useLayoutEffect, Suspense, lazy } from 'react';
import { ProfileProvider } from './context/ProfileContext';
import { CartProvider } from './context/CartContext';
import { Layout } from './components/Layout';
import { Loader } from './components/Loader';
import { ProtectedRoute } from './components/ProtectedRoute';
import { FullBleedShell, InvisibleMobileFrameShell } from './components/layout/AppRouteShells';
import { initializeApp } from './utils/appInitialization';
import { useMobileWallet, useWalletCompatibility } from './hooks/useMobileWallet';
import { isMobile } from './utils/mobile';
import { PwaPrompt } from './components/PwaPrompt';
import AppShellBackground from './components/AppShellBackground';
import { syncFinappTheme, guardPublicTheme, guardAppTheme, getThemePathname } from './utils/finappThemeSync';
import { FinappNotificationProvider } from './context/FinappNotificationContext';
import { FinappNotificationHost } from './components/FinappNotificationHost';
import { DevNavigator } from './components/DevNavigator';
import { WalletConnectMobileGuide } from './components/WalletConnectMobileGuide';
import { WalletModalLockRelease } from './components/WalletModalLockRelease';
import { MobileWalletConnectHelp } from './components/wallet/MobileWalletConnectHelp';
import { WalletStuckConnectionRecovery } from './components/wallet/WalletStuckConnectionRecovery';
import { WalletConnectIntentSync } from './components/wallet/WalletConnectIntentSync';
import Receive from './pages/wallet/Receive';

import './styles/style.scss';
import './styles/invisible-mobile-frame.css';
import './styles/finapp-content-frame.css';
import './styles/finapp-action-button.css';
import './styles/mywallet2-page.css';
import './styles/finapp-secondary-page.css';
import './styles/finapp-notification.css';
import './styles/rainbowkit-mobile.css';
import './styles/compatibility-warning.css';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const MyWallet = lazy(() => import('./pages/MyWallet'));
const CheckingCredit = lazy(() => import('./pages/business/CheckingCredit'));
const RanksAndStars = lazy(() => import('./pages/business/RanksAndStars'));
const Commissions = lazy(() => import('./pages/business/Commissions'));
const LiveEconomy = lazy(() => import('./pages/business/LiveEconomy'));
const Genealogy = lazy(() => import('./pages/Genealogy'));
const SendMoney = lazy(() => import('./pages/wallet/SendMoney'));
const Login = lazy(() => import('./pages/public/Login').then((module) => ({ default: module.Login })));
const Register = lazy(() => import('./pages/public/register').then((module) => ({ default: module.Register })));
const PublicEDex = lazy(() => import('./pages/public/PublicEDex').then((module) => ({ default: module.PublicEDex })));
const PublicInfoPage = lazy(() =>
  import('./pages/public/PublicInfoPage').then((module) => ({ default: module.PublicInfoPage })),
);
const Cards = lazy(() => import('./pages/Cards').then((module) => ({ default: module.Cards })));
const Settings = lazy(() => import('./pages/Settings').then((module) => ({ default: module.default })));
const EDex = lazy(() => import('./pages/EDex'));
const Activate = lazy(() => import('./pages/Activate'));
const ActivateExecution = lazy(() => import('./pages/activate/ActivateExecution'));
const TransactionHistory = lazy(() => import('./pages/TransactionHistory'));
const TransactionReport = lazy(() => import('./components/TransactionReport'));
const NFTDetails = lazy(() => import('./pages/NFTDetails'));
const Store = lazy(() => import('./pages/store/Store'));
const Cart = lazy(() => import('./pages/store/Cart'));
const Checking = lazy(() => import('./pages/store/Checking').then((module) => ({ default: module.Checking })));
const ProductDetail = lazy(() => import('./pages/store/ProductDetail'));
const UITest = lazy(() => import('./pages/UITest'));

/** Finapp theme scope — dual-theme: body.dark-mode toggles from Settings preference. */
function FinappThemeScope() {
  const location = useLocation();

  useLayoutEffect(() => {
    syncFinappTheme(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const syncFromHash = () => syncFinappTheme(getThemePathname());
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  useEffect(() => {
    if (!location.pathname) return;
    const observer = new MutationObserver(() => {
      guardPublicTheme(location.pathname);
      guardAppTheme(location.pathname);
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [location.pathname]);

  return null;
}

/** Clears legacy Finapp body animation classes that hide #appCapsule (blank pages). */
function RouteAnimationCleanup() {
  const location = useLocation();
  useEffect(() => {
    document.body.classList.remove('animationGoBack');
  }, [location.pathname]);
  return null;
}

function App() {
  const mobileWallet = useMobileWallet();
  const compatibility = useWalletCompatibility();
  const mobile = isMobile();

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    if (mobile) {
      document.body.classList.add('mobile-device');
      if (mobileWallet.isIOS) document.body.classList.add('ios-device');
      if (mobileWallet.isAndroid) document.body.classList.add('android-device');
    }
  }, [mobile, mobileWallet.isIOS, mobileWallet.isAndroid]);

  useEffect(() => {
    if (!compatibility.isChecking && !compatibility.isCompatible && compatibility.reasons.length > 0) {
      console.warn('Wallet compatibility issues:', compatibility.reasons);
    }
  }, [compatibility]);

  return (
    <ProfileProvider>
      <CartProvider>
        <FinappNotificationProvider>
        <Router>
          <FinappThemeScope />
          <AppShellBackground />
          <FinappNotificationHost />
          <RouteAnimationCleanup />
          <DevNavigator />
          <WalletConnectMobileGuide />
          <WalletModalLockRelease />
          <WalletConnectIntentSync />
          <WalletStuckConnectionRecovery />
          <MobileWalletConnectHelp />
          <div className="App relative min-h-[100dvh] bg-transparent">
            <PwaPrompt />

            {!compatibility.isChecking && !compatibility.isCompatible && (
              <div className="compatibility-warning" role="status">
                <div className="alert alert-warning m-2">
                  <strong>Browser Compatibility Warning:</strong>
                  <ul className="mb-0 mt-1">
                    {compatibility.reasons.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                  {compatibility.recommendations.length > 0 && (
                    <div className="mt-2">
                      <strong>Recommendations:</strong>
                      <ul className="mb-0 mt-1">
                        {compatibility.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Routes>
              {/* Full-bleed — no desktop mobile column */}
              <Route element={<FullBleedShell />}>
                <Route path="/login" element={<Suspense fallback={<Loader />}><Login /></Suspense>} />
                <Route path="/Login" element={<Navigate to="/login" replace />} />
                <Route path="/register" element={<Suspense fallback={<Loader />}><Register /></Suspense>} />
                <Route path="/Register" element={<Navigate to="/register" replace />} />
                <Route path="/REGISTER" element={<Navigate to="/register" replace />} />
                <Route path="/register-confirm" element={<Navigate to="/register" replace />} />
                <Route path="/public-edex" element={<Suspense fallback={<Loader />}><PublicEDex /></Suspense>} />
                <Route path="/services" element={<Suspense fallback={<Loader />}><PublicInfoPage /></Suspense>} />
                <Route path="/about" element={<Suspense fallback={<Loader />}><PublicInfoPage /></Suspense>} />
                <Route path="/contact" element={<Suspense fallback={<Loader />}><PublicInfoPage /></Suspense>} />
                <Route path="/ui-test" element={<Suspense fallback={<Loader />}><UITest /></Suspense>} />
              </Route>

              {/* Invisible mobile column on desktop (md+) — all other routes */}
              <Route element={<InvisibleMobileFrameShell />}>
              <Route
                path="/"
                element={
                  <ProtectedRoute requireWallet={true}>
                    <Suspense fallback={<Loader />}>
                      <Dashboard />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route path="/p" element={<Navigate to="/" replace />} />
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="/wallet" element={<Navigate to="/MyWallet" replace />} />
              <Route path="/my-wallet" element={<Navigate to="/MyWallet" replace />} />
              <Route path="/Dashboard" element={<Navigate to="/MyWallet" replace />} />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute requireWallet={true}>
                    <Suspense fallback={<Loader />}>
                      <Settings />
                    </Suspense>
                  </ProtectedRoute>
                }
              />

              <Route element={<ProtectedRoute requireWallet={true}><Layout /></ProtectedRoute>}>
                <Route path="/MyWallet" element={<Suspense fallback={<Loader />}><MyWallet /></Suspense>} />
                <Route path="/MyWallet2" element={<Navigate to="/MyWallet" replace />} />
                <Route path="/business/checking-credit" element={<Suspense fallback={<Loader />}><CheckingCredit /></Suspense>} />
                <Route path="/checking-credit" element={<Navigate to="/business/checking-credit" replace />} />
                <Route path="/business/stars" element={<Suspense fallback={<Loader />}><RanksAndStars /></Suspense>} />
                <Route path="/business/commissions" element={<Suspense fallback={<Loader />}><Commissions /></Suspense>} />
                <Route path="/business/live-economy" element={<Suspense fallback={<Loader />}><LiveEconomy /></Suspense>} />
                <Route path="/genealogy" element={<Suspense fallback={<Loader />}><Genealogy /></Suspense>} />
                <Route path="/geneology" element={<Navigate to="/genealogy" replace />} />
                <Route path="/claim-stars" element={<Navigate to="/business/stars" replace />} />
                <Route path="/pending-stars" element={<Navigate to="/business/stars" replace />} />
                <Route
                  path="/pending-stars/history"
                  element={<Navigate to="/transactions?tab=stars" replace />}
                />
                <Route path="/reports-stars" element={<Navigate to="/business/stars" replace />} />
                <Route path="/withdraw-e1" element={<Navigate to="/business/commissions" replace />} />
                <Route path="/commissions" element={<Navigate to="/business/commissions" replace />} />
                <Route path="/ranks" element={<Navigate to="/business/stars" replace />} />
                <Route path="/business/ranks-and-stars" element={<Navigate to="/business/stars" replace />} />
                <Route path="/send-money" element={<Suspense fallback={<Loader />}><SendMoney /></Suspense>} />
                <Route path="/receive" element={<Receive />} />
                <Route path="/receive/share" element={<Navigate to="/receive" replace />} />
                <Route path="/Receive" element={<Navigate to="/receive" replace />} />
                <Route path="/cards" element={<Suspense fallback={<Loader />}><Cards /></Suspense>} />
                <Route path="/edex" element={<Suspense fallback={<Loader />}><EDex /></Suspense>} />
                <Route path="/edex/history" element={<Navigate to="/transactions?tab=edex" replace />} />
                <Route
                  path="/transactions"
                  element={
                    <Suspense fallback={<Loader />}>
                      <TransactionHistory />
                    </Suspense>
                  }
                />
                <Route path="/exchange" element={<Navigate to="/edex" replace />} />
                <Route
                  path="/transaction/:transactionId"
                  element={
                    <Suspense fallback={<Loader />}>
                      <TransactionReport />
                    </Suspense>
                  }
                />
                <Route path="/Activate" element={<Suspense fallback={<Loader />}><Activate /></Suspense>} />
                <Route path="/activate" element={<Navigate to="/Activate" replace />} />
                <Route
                  path="/checking"
                  element={
                    <Suspense fallback={<Loader />}>
                      <Checking />
                    </Suspense>
                  }
                />
                <Route
                  path="/activate/execution"
                  element={
                    <Suspense fallback={<Loader />}>
                      <ActivateExecution />
                    </Suspense>
                  }
                />
                <Route path="/activate/history" element={<Navigate to="/transactions?tab=activate" replace />} />
              </Route>

              <Route
                path="/nft-details"
                element={
                  <ProtectedRoute requireWallet={true}>
                    <Suspense fallback={<Loader />}>
                      <NFTDetails />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/nft-details/:id"
                element={
                  <ProtectedRoute requireWallet={true}>
                    <Suspense fallback={<Loader />}>
                      <NFTDetails />
                    </Suspense>
                  </ProtectedRoute>
                }
              />

              {/* Store module */}
              <Route
                path="/store"
                element={
                  <ProtectedRoute requireWallet={true}>
                    <Suspense fallback={<Loader />}>
                      <Store />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route path="/store1" element={<Navigate to="/store" replace />} />
              <Route
                path="/product"
                element={
                  <Suspense fallback={<Loader />}>
                    <ProductDetail />
                  </Suspense>
                }
              />
              <Route
                path="/product/:id"
                element={
                  <Suspense fallback={<Loader />}>
                    <ProductDetail />
                  </Suspense>
                }
              />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute requireWallet={true}>
                    <Suspense fallback={<Loader />}>
                      <Cart />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route path="/my-plan" element={<Navigate to="/" replace />} />

              <Route path="*" element={<ProtectedRoute requireWallet={true}><Navigate to="/" replace /></ProtectedRoute>} />
              </Route>
            </Routes>
          </div>
        </Router>
        </FinappNotificationProvider>
      </CartProvider>
    </ProfileProvider>
  );
}

export default App;
