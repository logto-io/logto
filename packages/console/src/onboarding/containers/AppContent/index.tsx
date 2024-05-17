import { useRoutes, type RouteObject, Navigate } from 'react-router-dom';

import { usePlausiblePageview } from '@/hooks/use-plausible-pageview';
import Topbar from '@/onboarding/components/Topbar';
import SignInExperience from '@/onboarding/pages/SignInExperience';
import Welcome from '@/onboarding/pages/Welcome';
import { OnboardingPage, OnboardingRoute } from '@/onboarding/types';
import NotFound from '@/pages/NotFound';

import * as styles from './index.module.scss';

const routeObjects: RouteObject[] = [
  {
    path: OnboardingRoute.Onboarding,
    children: [
      {
        index: true,
        element: <Navigate replace to={OnboardingPage.Welcome} />,
      },
      {
        path: OnboardingPage.Welcome,
        element: <Welcome />,
      },
      {
        path: OnboardingPage.SignInExperience,
        element: <SignInExperience />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

function AppContent() {
  const routes = useRoutes(routeObjects);

  usePlausiblePageview(routeObjects);

  return (
    <div className={styles.app}>
      <Topbar />
      <div className={styles.content}>{routes}</div>
    </div>
  );
}

export default AppContent;
