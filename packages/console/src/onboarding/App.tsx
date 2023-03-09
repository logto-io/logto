import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SWRConfig } from 'swr';

import AppLoading from '@/components/AppLoading';
import Toast from '@/components/Toast';
import { getBasename } from '@/consts';
import AppBoundary from '@/containers/AppBoundary';
import useSwrOptions from '@/hooks/use-swr-options';
import Callback from '@/pages/Callback';
import NotFound from '@/pages/NotFound';

import * as styles from './App.module.scss';
import AppContent from './containers/AppContent';
import useUserOnboardingData from './hooks/use-user-onboarding-data';
import About from './pages/About';
import Congrats from './pages/Congrats';
import SignInExperience from './pages/SignInExperience';
import Welcome from './pages/Welcome';
import { OnboardingPage, OnboardingRoute } from './types';
import { getOnboardingPage } from './utils';

const welcomePathname = getOnboardingPage(OnboardingPage.Welcome);

const App = () => {
  const swrOptions = useSwrOptions();

  const {
    data: { questionnaire },
    isLoaded,
  } = useUserOnboardingData();

  if (!isLoaded) {
    return <AppLoading />;
  }

  return (
    <BrowserRouter basename={getBasename()}>
      <div className={styles.app}>
        <SWRConfig value={swrOptions}>
          <AppBoundary>
            <Toast />
            <Routes>
              <Route path="callback" element={<Callback />} />
              <Route index element={<Navigate replace to={welcomePathname} />} />
              <Route path={`/${OnboardingRoute.Onboarding}`} element={<AppContent />}>
                <Route index element={<Navigate replace to={welcomePathname} />} />
                <Route path={OnboardingPage.Welcome} element={<Welcome />} />
                <Route
                  path={OnboardingPage.AboutUser}
                  element={questionnaire ? <About /> : <Navigate replace to={welcomePathname} />}
                />
                <Route
                  path={OnboardingPage.SignInExperience}
                  element={
                    questionnaire ? <SignInExperience /> : <Navigate replace to={welcomePathname} />
                  }
                />
                <Route
                  path={OnboardingPage.Congrats}
                  element={questionnaire ? <Congrats /> : <Navigate replace to={welcomePathname} />}
                />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppBoundary>
        </SWRConfig>
      </div>
    </BrowserRouter>
  );
};

export default App;
