import { Theme } from '@logto/schemas';
import { useContext, useEffect } from 'react';
import { Route, Navigate, Outlet, Routes } from 'react-router-dom';
import { SWRConfig } from 'swr';

import AppBoundary from '@/containers/AppBoundary';
import ProtectedRoutes from '@/containers/ProtectedRoutes';
import TenantAccess from '@/containers/TenantAccess';
import { AppThemeContext } from '@/contexts/AppThemeProvider';
import Toast from '@/ds-components/Toast';
import useSwrOptions from '@/hooks/use-swr-options';
import useTenantPathname from '@/hooks/use-tenant-pathname';

import AppContent from './containers/AppContent';
import useUserOnboardingData from './hooks/use-user-onboarding-data';
import * as styles from './index.module.scss';
import { OnboardingPage, OnboardingRoute } from './types';
import { getOnboardingPage } from './utils';

const welcomePathname = getOnboardingPage(OnboardingPage.Welcome);

function Layout() {
  const swrOptions = useSwrOptions();
  const { setThemeOverride } = useContext(AppThemeContext);
  const { match, getTo } = useTenantPathname();

  useEffect(() => {
    setThemeOverride(Theme.Light);

    return () => {
      setThemeOverride(undefined);
    };
  }, [setThemeOverride]);

  const {
    data: { questionnaire },
  } = useUserOnboardingData();

  // Redirect to the welcome page if the user has not started the onboarding process.
  if (!questionnaire && !match(welcomePathname)) {
    return <Navigate replace to={getTo(welcomePathname)} />;
  }

  return (
    <div className={styles.app}>
      <SWRConfig value={swrOptions}>
        <AppBoundary>
          <Toast />
          <Outlet />
        </AppBoundary>
      </SWRConfig>
    </div>
  );
}

export function OnboardingRoutes() {
  return (
    <Routes>
      <Route path="/:tenantId" element={<ProtectedRoutes />}>
        <Route element={<TenantAccess />}>
          <Route element={<Layout />}>
            <Route index element={<Navigate replace to={OnboardingRoute.Onboarding} />} />
            <Route path="*" element={<AppContent />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
