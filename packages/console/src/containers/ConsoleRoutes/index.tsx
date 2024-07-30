import { ossConsolePath } from '@logto/schemas';
import { Suspense } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { safeLazy } from 'react-safe-lazy';
import { SWRConfig } from 'swr';

import AppLoading from '@/components/AppLoading';
import { isCloud, isDevFeaturesEnabled } from '@/consts/env';
import AppBoundary from '@/containers/AppBoundary';
import AppContent, { RedirectToFirstItem } from '@/containers/AppContent';
import ConsoleContent from '@/containers/ConsoleContent';
import ProtectedRoutes from '@/containers/ProtectedRoutes';
import TenantAccess from '@/containers/TenantAccess';
import { GlobalRoute } from '@/contexts/TenantsProvider';
import useSwrOptions from '@/hooks/use-swr-options';
import Callback from '@/pages/Callback';
import CheckoutSuccessCallback from '@/pages/CheckoutSuccessCallback';
import { dropLeadingSlash } from '@/utils/url';

import { __Internal__ImportError } from './internal';

const Welcome = safeLazy(async () => import('@/pages/Welcome'));
const Profile = safeLazy(async () => import('@/pages/Profile'));

function Layout() {
  const swrOptions = useSwrOptions();

  return (
    <SWRConfig value={swrOptions}>
      <AppBoundary>
        <Outlet />
      </AppBoundary>
    </SWRConfig>
  );
}

export function ConsoleRoutes() {
  return (
    <Suspense fallback={<AppLoading />}>
      <Routes>
        {/**
         * OSS doesn't have a tenant concept nor root path handling component, but it may
         * navigate to the root path in frontend. In this case, we redirect it to the OSS
         * console path to trigger the console routes.
         */}
        {!isCloud && <Route path="/" element={<Navigate to={ossConsolePath} />} />}
        <Route path="/:tenantId" element={<Layout />}>
          <Route path="callback" element={<Callback />} />
          <Route path="welcome" element={<Welcome />} />
          {isDevFeaturesEnabled && (
            <Route path="__internal__/import-error" element={<__Internal__ImportError />} />
          )}
          <Route element={<ProtectedRoutes />}>
            <Route path={dropLeadingSlash(GlobalRoute.Profile) + '/*'} element={<Profile />} />
            <Route element={<TenantAccess />}>
              {isCloud && (
                <Route
                  path={dropLeadingSlash(GlobalRoute.CheckoutSuccessCallback)}
                  element={<CheckoutSuccessCallback />}
                />
              )}
              <Route element={<AppContent />}>
                <Route index element={<RedirectToFirstItem />} />
                <Route path="*" element={<ConsoleContent />} />
              </Route>
            </Route>
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
