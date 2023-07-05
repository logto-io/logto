import { useLogto } from '@logto/react';
import { useContext, useMemo } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import AppLoading from '@/components/AppLoading';
import { getBasename } from '@/consts';
import { isCloud } from '@/consts/env';
import { AppDataContext } from '@/contexts/AppDataProvider';
import useMeCustomData from '@/hooks/use-me-custom-data';
import useTrackUserId from '@/hooks/use-track-user-id';
import { OnboardingRoutes } from '@/onboarding';
import useUserOnboardingData from '@/onboarding/hooks/use-user-onboarding-data';
import { ConsoleRoutes } from '@/pages/ConsoleRoutes';

/** @deprecated Remove this layer. */
function TenantAppContainer() {
  const { userEndpoint } = useContext(AppDataContext);
  const { isLoaded } = useMeCustomData();
  const { isOnboarding } = useUserOnboardingData();
  const { isAuthenticated } = useLogto();

  const router = useMemo(
    () =>
      createBrowserRouter(
        [
          {
            path: '*',
            // Only authenticated user can access onboarding routes.
            // This looks weird and it will be refactored soon by merging the onboarding
            // routes with the console routes.
            Component: isAuthenticated && isOnboarding ? OnboardingRoutes : ConsoleRoutes,
          },
        ],
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
    [isAuthenticated, isOnboarding]
  );

  useTrackUserId();

  // Authenticated user should loading onboarding data before rendering the app.
  // This looks weird and it will be refactored soon by merging the onboarding
  // routes with the console routes.
  if (!userEndpoint || (isCloud && isAuthenticated && !isLoaded)) {
    return <AppLoading />;
  }

  return <RouterProvider router={router} />;
}

export default TenantAppContainer;
