import { Component, ConsoleEvent } from '@logto/app-insights/custom-event';
import { TrackOnce } from '@logto/app-insights/react';
import { Theme } from '@logto/schemas';
import { useContext, useEffect } from 'react';
import { Route, Navigate, Outlet, Routes } from 'react-router-dom';
import { SWRConfig } from 'swr';

import ReportConversion from '@/components/ReportConversion';
import AppBoundary from '@/containers/AppBoundary';
import ProtectedRoutes from '@/containers/ProtectedRoutes';
import TenantAccess from '@/containers/TenantAccess';
import { AppThemeContext } from '@/contexts/AppThemeProvider';
import Toast from '@/ds-components/Toast';
import useSwrOptions from '@/hooks/use-swr-options';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import NotFound from '@/pages/NotFound';

import AppContent from './containers/AppContent';
import useUserOnboardingData from './hooks/use-user-onboarding-data';
import * as styles from './index.module.scss';
import SignInExperience from './pages/SignInExperience';
import Welcome from './pages/Welcome';
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
    <>
      <TrackOnce component={Component.Console} event={ConsoleEvent.Onboard} />
      <div className={styles.app}>
        <SWRConfig value={swrOptions}>
          <AppBoundary>
            <ReportConversion />
            <Toast />
            <Outlet />
          </AppBoundary>
        </SWRConfig>
      </div>
    </>
  );
}

export function OnboardingRoutes() {
  return (
    <Routes>
      <Route path="/:tenantId" element={<ProtectedRoutes />}>
        <Route element={<TenantAccess />}>
          <Route element={<Layout />}>
            <Route index element={<Navigate replace to={OnboardingRoute.Onboarding} />} />
            <Route path={OnboardingRoute.Onboarding} element={<AppContent />}>
              <Route index element={<Navigate replace to={OnboardingPage.Welcome} />} />
              <Route path={OnboardingPage.Welcome} element={<Welcome />} />
              <Route path={OnboardingPage.SignInExperience} element={<SignInExperience />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
