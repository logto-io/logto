import { Component, ConsoleEvent } from '@logto/app-insights/custom-event';
import { TrackOnce } from '@logto/app-insights/react';
import { Theme } from '@logto/schemas';
import { useContext, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Route, Navigate, Outlet, Routes } from 'react-router-dom';
import { SWRConfig } from 'swr';

import AppBoundary from '@/containers/AppBoundary';
import ProtectedRoutes from '@/containers/ProtectedRoutes';
import TenantAccess from '@/containers/TenantAccess';
import { AppThemeContext } from '@/contexts/AppThemeProvider';
import Toast from '@/ds-components/Toast';
import useSwrOptions from '@/hooks/use-swr-options';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import NotFound from '@/pages/NotFound';

import { gtagAwTrackingId, gtagSignUpConversionId, logtoProductionHostname } from './constants';
import AppContent from './containers/AppContent';
import useUserOnboardingData from './hooks/use-user-onboarding-data';
import * as styles from './index.module.scss';
import SignInExperience from './pages/SignInExperience';
import Welcome from './pages/Welcome';
import { OnboardingPage, OnboardingRoute } from './types';
import { getOnboardingPage, gtag } from './utils';

const welcomePathname = getOnboardingPage(OnboardingPage.Welcome);
/**
 * Due to the special of Google Tag, it should be `true` only in the Logto Cloud production environment.
 * Add the leading '.' to make it safer (ignore hostnames like "foologto.io").
 */
const shouldReportToGtag = window.location.hostname.endsWith('.' + logtoProductionHostname);

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

  /**
   * This `useEffect()` initiates Google Tag and report a sign-up conversion to it.
   * It may run multiple times (e.g. a user visit multiple times to finish the onboarding process,
   * which rarely happens), but it'll be okay since we've set conversion's "Count" to "One"
   * which means only the first interaction is valuable.
   *
   * Track this conversion in the backend has been considered, but Google does not provide
   * a clear guideline for it and marks the [Node library](https://developers.google.com/tag-platform/tag-manager/api/v2/libraries)
   * as "alpha" which looks unreliable.
   */
  useEffect(() => {
    if (shouldReportToGtag) {
      gtag('js', new Date());
      gtag('config', gtagAwTrackingId);
      gtag('event', 'conversion', {
        send_to: gtagSignUpConversionId,
      });
      console.debug('Google Tag event fires');
    }
  }, []);

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
            {shouldReportToGtag && (
              <Helmet>
                <script
                  async
                  crossOrigin="anonymous"
                  src={`https://www.googletagmanager.com/gtag/js?id=${gtagAwTrackingId}`}
                />
              </Helmet>
            )}
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
