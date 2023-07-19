import { useLogto } from '@logto/react';
import { useContext } from 'react';

import AppLoading from '@/components/AppLoading';
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

  useTrackUserId();

  // Authenticated user should loading onboarding data before rendering the app.
  // This looks weird and it will be refactored soon by merging the onboarding
  // routes with the console routes.
  if (!userEndpoint || (isCloud && isAuthenticated && !isLoaded)) {
    return <AppLoading />;
  }

  return isAuthenticated && isOnboarding ? <OnboardingRoutes /> : <ConsoleRoutes />;
}

export default TenantAppContainer;
