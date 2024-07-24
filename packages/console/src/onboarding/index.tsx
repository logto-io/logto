import { Theme } from '@logto/schemas';
import { useContext, useEffect } from 'react';
import { Navigate, type RouteObject, useMatch, useRoutes } from 'react-router-dom';

import AppLoading from '@/components/AppLoading';
import AppBoundary from '@/containers/AppBoundary';
import { AppThemeContext } from '@/contexts/AppThemeProvider';
import { usePlausiblePageview } from '@/hooks/use-plausible-pageview';

import Topbar from './components/Topbar';
import useUserOnboardingData from './hooks/use-user-onboarding-data';
import styles from './index.module.scss';
import CreateTenant from './pages/CreateTenant';
import SignInExperience from './pages/SignInExperience';
import Welcome from './pages/Welcome';
import { OnboardingPage } from './types';
import { getOnboardingPage } from './utils';

const welcomePathname = getOnboardingPage(OnboardingPage.Welcome);

const routeObjects: RouteObject[] = [
  {
    index: true,
    element: <Navigate replace to={OnboardingPage.Welcome} />,
  },
  {
    path: OnboardingPage.Welcome,
    element: <Welcome />,
  },
  {
    path: OnboardingPage.CreateTenant,
    element: <CreateTenant />,
  },
  {
    path: `:tenantId/${OnboardingPage.SignInExperience}`,
    element: <SignInExperience />,
  },
];

export function OnboardingApp() {
  const { setThemeOverride } = useContext(AppThemeContext);
  const matched = useMatch(welcomePathname);
  const routes = useRoutes(routeObjects);

  usePlausiblePageview(routeObjects, 'onboarding');

  useEffect(() => {
    setThemeOverride(Theme.Light);

    return () => {
      setThemeOverride(undefined);
    };
  }, [setThemeOverride]);

  const {
    isLoading,
    data: { questionnaire, isOnboardingDone },
  } = useUserOnboardingData();

  if (isLoading) {
    return <AppLoading />;
  }

  if (isOnboardingDone) {
    return <Navigate replace to="/" />;
  }

  // Redirect to the welcome page if the user has not started the onboarding process.
  if (!questionnaire && !matched) {
    return <Navigate replace to={welcomePathname} />;
  }

  return (
    <div className={styles.app}>
      <AppBoundary>
        <Topbar />
        <div className={styles.content}>{routes}</div>
      </AppBoundary>
    </div>
  );
}
