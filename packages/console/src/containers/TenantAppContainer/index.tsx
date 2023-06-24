import { useContext, useMemo } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import AppLoading from '@/components/AppLoading';
import { getBasename } from '@/consts';
import { isCloud } from '@/consts/env';
import { AppEndpointsContext } from '@/contexts/AppEndpointsProvider';
import useTrackUserId from '@/hooks/use-track-user-id';
import { OnboardingRoutes } from '@/onboarding';
import useUserOnboardingData from '@/onboarding/hooks/use-user-onboarding-data';
import { ConsoleRoutes } from '@/pages/ConsoleRoutes';

function TenantAppContainer() {
  const { userEndpoint } = useContext(AppEndpointsContext);
  const { isOnboarding, isLoaded } = useUserOnboardingData();

  const router = useMemo(
    () =>
      createBrowserRouter(
        [{ path: '*', Component: isOnboarding ? OnboardingRoutes : ConsoleRoutes }],
        // Currently we use `window.open()` to navigate between tenants so the `useMemo` hook
        // can have no dependency and the router will be created anyway. Consider integrating the
        // tenant ID into the router and remove basename here if we want to use `history.pushState()`
        // to navigate.
        //
        // Caveat: To use `history.pushState()`, we'd better to create a browser router in the upper
        // level of the component tree to make the tenant ID a part of the URL. Otherwise, we need
        // to handle `popstate` event to update the tenant ID when the user navigates back.
        { basename: getBasename() }
      ),
    [isOnboarding]
  );

  useTrackUserId();

  if (!userEndpoint || (isCloud && !isLoaded)) {
    return <AppLoading />;
  }

  return <RouterProvider router={router} />;
}

export default TenantAppContainer;
