import { OrganizationInvitationStatus } from '@logto/schemas';
import { Navigate } from 'react-router-dom';

import AppLoading from '@/components/AppLoading';
import { isCloud } from '@/consts/env';
import { GlobalRoute } from '@/contexts/TenantsProvider';
import useCurrentUser from '@/hooks/use-current-user';
import useUserDefaultTenantId from '@/hooks/use-user-default-tenant-id';
import useUserInvitations from '@/hooks/use-user-invitations';
import useUserOnboardingData from '@/onboarding/hooks/use-user-onboarding-data';

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

  // A new user has just signed up, redirect them to the onboarding flow.
  if (isOnboarding) {
    return <Navigate to={GlobalRoute.Onboarding} />;
  }

  // If current tenant ID is not set, but the defaultTenantId is available.
  if (defaultTenantId) {
    return <Redirect toTenantId={defaultTenantId} />;
  }

  // If user has pending invitations (onboarding will be skipped), show the invitation list and allow them to quick join.
  if (isCloud && data?.length) {
    return <InvitationList invitations={data} />;
  }

  // If user has completed onboarding and still has no tenant, redirect to a special landing page.
  return <TenantLandingPage />;
}
