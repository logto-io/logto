import { OrganizationInvitationStatus } from '@logto/schemas';

import AppLoading from '@/components/AppLoading';
import { isCloud } from '@/consts/env';
import useCurrentUser from '@/hooks/use-current-user';
import useUserDefaultTenantId from '@/hooks/use-user-default-tenant-id';
import useUserInvitations from '@/hooks/use-user-invitations';
import useUserOnboardingData from '@/onboarding/hooks/use-user-onboarding-data';

import AutoCreateTenant from './AutoCreateTenant';
import InvitationList from './InvitationList';
import Redirect from './Redirect';
import TenantLandingPage from './TenantLandingPage';

export default function Main() {
  const { isLoaded } = useCurrentUser();
  const { isOnboarding } = useUserOnboardingData();
  const { defaultTenantId } = useUserDefaultTenantId();
  const { data } = useUserInvitations(OrganizationInvitationStatus.Pending);

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

  // If user has pending invitations (onboarding will be skipped), show the invitation list and allow them to quick join.
  if (isCloud && data?.length) {
    return <InvitationList invitations={data} />;
  }

  // If user has completed onboarding and still has no tenant, redirect to a special landing page.
  return <TenantLandingPage />;
}
