import { Component, ConsoleEvent } from '@logto/app-insights/custom-event';
import { TrackOnce } from '@logto/app-insights/react';
import { Theme } from '@logto/schemas';
import { useContext, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SWRConfig } from 'swr';

import AppLoading from '@/components/AppLoading';
import { getBasename } from '@/consts';
import AppBoundary from '@/containers/AppBoundary';
import { AppThemeContext } from '@/contexts/AppThemeProvider';
import Toast from '@/ds-components/Toast';
import useSwrOptions from '@/hooks/use-swr-options';
import NotFound from '@/pages/NotFound';

import * as styles from './App.module.scss';
import { gtagAwTrackingId, gtagSignUpConversionId, logtoProductionHostname } from './constants';
import AppContent from './containers/AppContent';
import useUserOnboardingData from './hooks/use-user-onboarding-data';
import About from './pages/About';
import Congrats from './pages/Congrats';
import SignInExperience from './pages/SignInExperience';
import Welcome from './pages/Welcome';
import { OnboardingPage, OnboardingRoute } from './types';
import { gtag } from './utils';

/**
 * Due to the special of Google Tag, it should be `true` only in the Logto Cloud production environment.
 * Add the leading '.' to make it safer (ignore hostnames like "foologto.io").
 */
const shouldReportToGtag = window.location.hostname.endsWith('.' + logtoProductionHostname);

function App() {
  const swrOptions = useSwrOptions();
  const { setThemeOverride } = useContext(AppThemeContext);

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
    isLoaded,
  } = useUserOnboardingData();

  if (!isLoaded) {
    return <AppLoading />;
  }

  return (
    <BrowserRouter basename={getBasename()}>
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
            <Routes>
              <Route index element={<Navigate replace to={OnboardingRoute.Onboarding} />} />
              <Route path={OnboardingRoute.Onboarding} element={<AppContent />}>
                <Route index element={<Navigate replace to={OnboardingPage.Welcome} />} />
                <Route path={OnboardingPage.Welcome} element={<Welcome />} />
                {questionnaire && (
                  <>
                    <Route path={OnboardingPage.AboutUser} element={<About />} />
                    <Route path={OnboardingPage.SignInExperience} element={<SignInExperience />} />
                    <Route path={OnboardingPage.Congrats} element={<Congrats />} />
                  </>
                )}
                {!questionnaire && (
                  <Route path="*" element={<Navigate replace to={OnboardingPage.Welcome} />} />
                )}
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppBoundary>
        </SWRConfig>
      </div>
    </BrowserRouter>
  );
}

export default App;
