import { Theme } from '@logto/schemas';
import { useContext, useEffect } from 'react';
import { Navigate, type RouteObject, useRoutes } from 'react-router-dom';

import AppLoading from '@/components/AppLoading';
import AppBoundary from '@/containers/AppBoundary';
import { AppThemeContext } from '@/contexts/AppThemeProvider';
import { usePlausiblePageview } from '@/hooks/use-plausible-pageview';

import Topbar from './components/Topbar';
import useUserOnboardingData from './hooks/use-user-onboarding-data';
import styles from './index.module.scss';
import CreateTenant from './pages/CreateTenant';
import { OnboardingPage } from './types';

const routeObjects: RouteObject[] = [
  {
    index: true,
    element: <Navigate replace to={OnboardingPage.CreateTenant} />,
  },
  {
    path: OnboardingPage.CreateTenant,
    element: <CreateTenant />,
  },
];

export function OnboardingApp() {
  const { setThemeOverride } = useContext(AppThemeContext);
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
    data: { isOnboardingDone },
  } = useUserOnboardingData();

  if (isLoading) {
    return <AppLoading />;
  }

  if (isOnboardingDone) {
    return <Navigate replace to="/" />;
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
