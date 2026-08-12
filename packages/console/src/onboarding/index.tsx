import { Theme } from '@logto/schemas';
import { useContext, useEffect } from 'react';
import { Navigate, type RouteObject, useRoutes } from 'react-router-dom';

import AppBoundary from '@/containers/AppBoundary';
import { AppThemeContext } from '@/contexts/AppThemeProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';
import { usePlausiblePageview } from '@/hooks/use-plausible-pageview';

import Topbar from './components/Topbar';
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
  const { tenants } = useContext(TenantsContext);
  const routes = useRoutes(routeObjects);

  usePlausiblePageview(routeObjects, 'onboarding');

  useEffect(() => {
    setThemeOverride(Theme.Light);

    return () => {
      setThemeOverride(undefined);
    };
  }, [setThemeOverride]);

  /**
   * The onboarding flow is only for creating the first tenant. Once the user has a tenant
   * (including the one just created in the flow), redirect back to let the root routing decide.
   * `ProtectedRoutes` guarantees the tenants data is loaded before this component renders.
   */
  if (tenants.length > 0) {
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
