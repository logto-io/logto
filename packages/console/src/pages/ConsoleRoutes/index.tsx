import { Component, GeneralEvent } from '@logto/app-insights/custom-event';
import { TrackOnce } from '@logto/app-insights/react';
import { Outlet, Route, Routes } from 'react-router-dom';
import { SWRConfig } from 'swr';

import { isCloud, isProduction } from '@/consts/env';
import { checkoutSuccessCallbackPath } from '@/consts/subscriptions';
import AppBoundary from '@/containers/AppBoundary';
import AppContent, { RedirectToFirstItem } from '@/containers/AppContent';
import ConsoleContent from '@/containers/ConsoleContent';
import ProtectedRoutes from '@/containers/ProtectedRoutes';
import TenantAccess from '@/containers/TenantAccess';
import Toast from '@/ds-components/Toast';
import useSwrOptions from '@/hooks/use-swr-options';
import Callback from '@/pages/Callback';
import Welcome from '@/pages/Welcome';

import CheckoutSuccessCallback from '../CheckoutSuccessCallback';
import HandleSocialCallback from '../Profile/containers/HandleSocialCallback';

function Layout() {
  const swrOptions = useSwrOptions();

  return (
    <SWRConfig value={swrOptions}>
      <AppBoundary>
        <TrackOnce component={Component.Console} event={GeneralEvent.Visit} />
        <Toast />
        <Outlet />
      </AppBoundary>
    </SWRConfig>
  );
}

export function ConsoleRoutes() {
  return (
    <Routes>
      <Route path="/:tenantId" element={<Layout />}>
        <Route path="callback" element={<Callback />} />
        <Route path="welcome" element={<Welcome />} />
        <Route element={<ProtectedRoutes />}>
          <Route path="handle-social" element={<HandleSocialCallback />} />
          <Route element={<TenantAccess />}>
            {!isProduction && isCloud && (
              <Route path={checkoutSuccessCallbackPath} element={<CheckoutSuccessCallback />} />
            )}
            <Route element={<AppContent />}>
              <Route index element={<RedirectToFirstItem />} />
              <Route path="*" element={<ConsoleContent />} />
            </Route>
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
