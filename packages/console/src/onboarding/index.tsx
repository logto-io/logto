import { Component, ConsoleEvent } from '@logto/app-insights/custom-event';
import { TrackOnce } from '@logto/app-insights/react';
import { Theme } from '@logto/schemas';
import { useContext, useEffect } from 'react';
import { Route, Navigate, Outlet, Routes } from 'react-router-dom';
import { SWRConfig } from 'swr';

import { useReportConversion } from '@/components/Conversion';
import { GtagConversionId } from '@/components/Conversion/utils';
import AppBoundary from '@/containers/AppBoundary';
import ProtectedRoutes from '@/containers/ProtectedRoutes';
import TenantAccess from '@/containers/TenantAccess';
import { AppThemeContext } from '@/contexts/AppThemeProvider';
import Toast from '@/ds-components/Toast';
import useCurrentUser from '@/hooks/use-current-user';
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

  // User object should be available at this point as it's rendered by the `<AppRoutes />`
  // component in `packages/console/src/App.tsx`.
  const { user } = useCurrentUser();

  /**
   * Report a sign-up conversion.
   *
   * Note it may run multiple times (e.g. a user visit multiple times to finish the onboarding process,
   * which rarely happens). We should turn on deduplication settings in the provider's dashboard. For
   * example, in Google, we should set conversion's "Count" to "One".
   */
  useReportConversion({
    gtagId: GtagConversionId.SignUp,
    redditType: 'SignUp',
    transactionId: user?.id,
  });

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
