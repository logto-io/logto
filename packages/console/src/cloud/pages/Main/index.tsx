import AppLoading from '@/components/AppLoading';
import useCurrentUser from '@/hooks/use-current-user';
import useUserDefaultTenantId from '@/hooks/use-user-default-tenant-id';
import useUserOnboardingData from '@/onboarding/hooks/use-user-onboarding-data';

import AutoCreateTenant from './AutoCreateTenant';
import Redirect from './Redirect';
import TenantLandingPage from './TenantLandingPage';

export default function Main() {
  const { isLoaded } = useCurrentUser();
  const { isOnboarding } = useUserOnboardingData();
  const { defaultTenantId } = useUserDefaultTenantId();

  if (!isLoaded) {
    return <AppLoading />;
  }

  // If current tenant ID is not set, but the defaultTenantId is available.
  if (defaultTenantId) {
    return <Redirect toTenantId={defaultTenantId} />;
  }

  // A new user has just signed up and has no tenant, needs to create a new tenant.
  if (isOnboarding) {
    return <AutoCreateTenant />;
  }

  // If user has completed onboarding and still has no tenant, redirect to a special landing page.
  return <TenantLandingPage />;
}
