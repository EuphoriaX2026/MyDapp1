import React, { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SendActionSheet } from './SendActionSheet';
import { Loader } from './Loader';

/** App shell for nested routes — sidebar menu lives only on Dashboard.tsx */
export const Layout: React.FC = () => {
  const { pathname } = useLocation();
  const isMyWalletRoute = /^\/MyWallet2?$/i.test(pathname);

  return (
    <>
      <div className={`dapp-page${isMyWalletRoute ? ' mywallet2-route' : ''}`}>
        <div id="appCapsule">
          <Suspense fallback={<Loader />}>
            <Outlet />
          </Suspense>
        </div>
      </div>

      <SendActionSheet />
    </>
  );
};
