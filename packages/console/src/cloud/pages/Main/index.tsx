import { OrganizationInvitationStatus } from '@logto/schemas';
import { Navigate } from 'react-router-dom';

import AppLoading from '@/components/AppLoading';
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
  const { defaultTenantId } = useUserDefaultTenantId();
  const {
    data: { isOnboardingDone },
  } = useUserOnboardingData();
  const { data: invitations, isLoading: isInvitationsLoading } = useUserInvitations(
    OrganizationInvitationStatus.Pending
  );

  if (!isLoaded) {
    return <AppLoading />;
  }

  /**
   * If the user has a tenant, redirect to it. `TenantsProvider` guarantees the tenants data
   * is loaded before this component renders (see `ProtectedRoutes`).
   */
  if (defaultTenantId) {
    return <Redirect toTenantId={defaultTenantId} />;
  }

  /**
   * The user has no tenant. Wait for the invitations to load before deciding where to go.
   * If the request fails, fall back to the branches below so the user can still create a tenant.
   */
  if (isInvitationsLoading) {
    return <AppLoading />;
  }

  // If the user has pending invitations, show the invitation list and allow them to quick join.
  if (invitations?.length) {
    return <InvitationList invitations={invitations} />;
  }

  /**
   * The user has completed onboarding before (e.g., deleted or left all their tenants), show
   * the landing page which allows creating tenants with the full-featured modal.
   */
  if (isOnboardingDone) {
    return <TenantLandingPage />;
  }

  /**
   * A new user with no tenant and no pending invitations, redirect them to the onboarding flow
   * to create their first tenant.
   */
  return <Navigate to={GlobalRoute.Onboarding} />;
}
