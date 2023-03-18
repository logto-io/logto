import { useContext } from 'react';

import AppLoading from '@/components/AppLoading';
import { isCloud } from '@/consts/cloud';
import { AppEndpointsContext } from '@/contexts/AppEndpointsProvider';
import OnboardingApp from '@/onboarding/App';
import useUserOnboardingData from '@/onboarding/hooks/use-user-onboarding-data';
import ConsoleApp from '@/pages/Main';

const TenantAppContainer = () => {
  const { userEndpoint } = useContext(AppEndpointsContext);
  const { isOnboarding, isLoaded } = useUserOnboardingData();

  if (!userEndpoint || (isCloud && !isLoaded)) {
    return <AppLoading />;
  }

  if (isOnboarding) {
    return <OnboardingApp />;
  }

  return <ConsoleApp />;
};

export default TenantAppContainer;
