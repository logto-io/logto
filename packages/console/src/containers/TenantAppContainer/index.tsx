import { useLogto } from '@logto/react';
import { type TenantInfo } from '@logto/schemas/lib/models/tenants.js';
import { trySafe } from '@silverhand/essentials';
import { useContext, useEffect } from 'react';

import AppLoading from '@/components/AppLoading';
import { getCallbackUrl } from '@/consts';
import { isCloud } from '@/consts/env';
import { AppEndpointsContext } from '@/contexts/AppEndpointsProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';
import useTrackUserId from '@/hooks/use-track-user-id';
import OnboardingApp from '@/onboarding/App';
import useUserOnboardingData from '@/onboarding/hooks/use-user-onboarding-data';
import ConsoleApp from '@/pages/Main';

function TenantAppContainer() {
  const { getAccessToken, signIn } = useLogto();
  const { userEndpoint } = useContext(AppEndpointsContext);
  const { isOnboarding, isLoaded } = useUserOnboardingData();
  const { currentTenant } = useContext(TenantsContext);

  useEffect(() => {
    const validate = async ({ indicator, id }: TenantInfo) => {
      // Test fetching an access token for the current Tenant ID.
      // If failed, it means the user finishes the first auth, ands still needs to auth again to
      // fetch the full-scoped (with all available tenants) token.
      if (!(await trySafe(getAccessToken(indicator)))) {
        void signIn(getCallbackUrl(id).href);
      }
    };

    if (currentTenant) {
      void validate(currentTenant);
    }
  }, [currentTenant, getAccessToken, signIn]);

  useTrackUserId();

  if (!userEndpoint || (isCloud && !isLoaded)) {
    return <AppLoading />;
  }

  if (isOnboarding) {
    return <OnboardingApp />;
  }

  return <ConsoleApp />;
}

export default TenantAppContainer;
