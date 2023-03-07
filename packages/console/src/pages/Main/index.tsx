import { useContext } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { SWRConfig } from 'swr';

import useUserOnboardingData from '@/cloud/hooks/use-user-onboarding-data';
import Onboarding from '@/cloud/pages/Onboarding';
import { CloudRoute } from '@/cloud/types';
import AppLoading from '@/components/AppLoading';
import Toast from '@/components/Toast';
import { getBasename } from '@/consts';
import { isCloud } from '@/consts/cloud';
import AppBoundary from '@/containers/AppBoundary';
import AppContent from '@/containers/AppContent';
import ConsoleContent from '@/containers/ConsoleContent';
import { AppEndpointsContext } from '@/contexts/AppEndpointsProvider';
import useSwrOptions from '@/hooks/use-swr-options';
import Callback from '@/pages/Callback';
import Welcome from '@/pages/Welcome';

import HandleSocialCallback from '../Profile/containers/HandleSocialCallback';

const Main = () => {
  const swrOptions = useSwrOptions();
  const { userEndpoint } = useContext(AppEndpointsContext);
  const {
    data: { isOnboardingDone },
    isLoaded,
  } = useUserOnboardingData();

  if (!userEndpoint || (isCloud && !isLoaded)) {
    return <AppLoading />;
  }

  const isOnboarding = isCloud && !isOnboardingDone;

  return (
    <BrowserRouter basename={getBasename()}>
      <SWRConfig value={swrOptions}>
        <AppBoundary>
          <Toast />
          <Routes>
            <Route path="callback" element={<Callback />} />
            <Route path="welcome" element={<Welcome />} />
            <Route path="handle-social" element={<HandleSocialCallback />} />
            <Route element={<AppContent />}>
              {isOnboarding ? (
                <Route>
                  <Route index element={<Navigate replace to={`/${CloudRoute.Onboarding}`} />} />
                  <Route path={`/${CloudRoute.Onboarding}/*`} element={<Onboarding />} />
                </Route>
              ) : (
                <Route path="/*" element={<ConsoleContent />} />
              )}
            </Route>
          </Routes>
        </AppBoundary>
      </SWRConfig>
    </BrowserRouter>
  );
};

export default Main;
