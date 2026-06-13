import { Outlet } from 'react-router-dom';
import { AppMobileBottomNav } from '../AppMobileBottomNav';

/** Full-bleed shell — login, public-edex, services, about, contact only. */
export function FullBleedShell() {
  return (
    <div className="w-full min-h-screen">
      <Outlet />
    </div>
  );
}

/** App column shell — max-width 28rem, centered on wide viewports. */
export function InvisibleMobileFrameShell() {
  return (
    <div className="w-full min-h-[100dvh]">
      <div className="invisible-mobile-frame relative mx-auto w-full min-h-[100dvh] max-w-[28rem] overflow-x-hidden pb-[calc(56px+env(safe-area-inset-bottom,0px))]">
        <Outlet />
        <AppMobileBottomNav />
      </div>
    </div>
  );
}
