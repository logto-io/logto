import { type OrganizationScope, TenantScope } from '@logto/schemas';
import { useContext, useMemo } from 'react';
import useSWR from 'swr';

import { useAuthedCloudApi } from '@/cloud/hooks/use-cloud-api';
import { adminTenantEndpoint, meApi } from '@/consts';
import { isCloud } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';
import { getIsReadOnlyAccess, getIsWriteAccessConfirmed } from '@/utils/read-only-access';

import { type RequestError, useStaticApi } from './use-api';
import useCurrentUser from './use-current-user';

const useCurrentTenantScopes = () => {
  const { currentTenantId } = useContext(TenantsContext);
  const { licenseQuota } = useContext(SubscriptionDataContext);
  const cloudApi = useAuthedCloudApi();
  const meApiClient = useStaticApi({
    prefixUrl: adminTenantEndpoint,
    resourceIndicator: meApi.indicator,
  });
  const { user } = useCurrentUser();
  const userId = user?.id ?? '';

  const {
    data: scopes,
    isLoading,
    mutate,
  } = useSWR<string[], RequestError>(
    // A self-hosted deployment has one tenant, whose scopes live on the admin tenant's `/me`.
    // Cloud pages outside a tenant, such as Console SSO, have no tenant scopes.
    isCloud
      ? userId && currentTenantId && `api/tenants/${currentTenantId}/members/${userId}/scopes`
      : userId && 'me/tenant/scopes',
    async () => {
      if (!isCloud) {
        const scopes = await meApiClient.get('me/tenant/scopes').json<OrganizationScope[]>();
        return scopes.map(({ name }) => name);
      }

      const scopes = await cloudApi.get('/api/tenants/:tenantId/members/:userId/scopes', {
        params: { tenantId: currentTenantId, userId },
      });
      return scopes.map(({ name }) => name);
    },
    // A self-hosted member's role cannot change: every member is an admin.
    { revalidateIfStale: isCloud }
  );

  const access = useMemo(
    () => ({
      canInviteMember:
        Boolean(scopes?.includes(TenantScope.InviteMember)) &&
        (isCloud || licenseQuota.consoleCollaboration),
      canRemoveMember: Boolean(scopes?.includes(TenantScope.RemoveMember)),
      canUpdateMemberRole: Boolean(scopes?.includes(TenantScope.UpdateMemberRole)),
      canManageTenant: Boolean(scopes?.includes(TenantScope.ManageTenant)),
      isReadOnly: getIsReadOnlyAccess({ isCloud, scopes }),
      isWriteAccessConfirmed: getIsWriteAccessConfirmed({ isCloud, scopes }),
      // The Management API refuses credentials to a read-only member, so they are requested only
      // once the scopes confirm write access.
      canReadCredentials: getIsWriteAccessConfirmed({ isCloud, scopes }),
    }),
    [licenseQuota.consoleCollaboration, scopes]
  );

  return useMemo(
    () => ({
      isLoading,
      scopes,
      access,
      mutate,
    }),
    [isLoading, scopes, access, mutate]
  );
};

export default useCurrentTenantScopes;
