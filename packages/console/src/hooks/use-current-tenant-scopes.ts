import { type OrganizationScope, TenantScope } from '@logto/schemas';
import { useContext, useMemo } from 'react';
import useSWR from 'swr';

import { useAuthedCloudApi } from '@/cloud/hooks/use-cloud-api';
import { adminTenantEndpoint, meApi } from '@/consts';
import { isCloud, isDevFeaturesEnabled } from '@/consts/env';
import { TenantsContext } from '@/contexts/TenantsProvider';

import { type RequestError, useStaticApi } from './use-api';
import useCurrentUser from './use-current-user';

/**
 * Self-hosted plans: the tenant scopes of a self-hosted deployment come with its members and
 * invitations, which ship with the unlaunched self-hosted Pro and Enterprise plans. Removed
 * together with the other self-hosted plans guards at launch.
 */
const shouldFetchOssTenantScopes = !isCloud && isDevFeaturesEnabled;

const useCurrentTenantScopes = () => {
  const { currentTenantId } = useContext(TenantsContext);
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
    isCloud
      ? userId && `api/tenants/${currentTenantId}/members/${userId}/scopes`
      : shouldFetchOssTenantScopes && userId && 'me/tenant/scopes',
    async () => {
      if (!isCloud) {
        const scopes = await meApiClient.get('me/tenant/scopes').json<OrganizationScope[]>();
        return scopes.map(({ name }) => name);
      }

      const scopes = await cloudApi.get('/api/tenants/:tenantId/members/:userId/scopes', {
        params: { tenantId: currentTenantId, userId },
      });
      return scopes.map(({ name }) => name);
    }
  );

  const access = useMemo(
    () => ({
      canInviteMember: Boolean(scopes?.includes(TenantScope.InviteMember)),
      canRemoveMember: Boolean(scopes?.includes(TenantScope.RemoveMember)),
      canUpdateMemberRole: Boolean(scopes?.includes(TenantScope.UpdateMemberRole)),
      canManageTenant: Boolean(scopes?.includes(TenantScope.ManageTenant)),
    }),
    [scopes]
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
