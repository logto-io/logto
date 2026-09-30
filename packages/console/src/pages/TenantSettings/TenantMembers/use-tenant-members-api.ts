import { OrganizationInvitationStatus, type TenantRole } from '@logto/schemas';
import { useContext, useMemo } from 'react';

import { useAuthedCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type TenantInvitationResponse, type TenantMemberResponse } from '@/cloud/types/router';
import { adminTenantEndpoint, meApi } from '@/consts';
import { isCloud } from '@/consts/env';
import { TenantsContext } from '@/contexts/TenantsProvider';
import { useStaticApi } from '@/hooks/use-api';

/**
 * The tenant member and invitation operations Console performs, whichever service holds them.
 *
 * The SWR keys are part of the contract: pages that list the same data share a key, so a change in
 * one refreshes the others.
 */
type TenantMembersApi = {
  membersKey: string;
  invitationsKey: string;
  getMembers: () => Promise<TenantMemberResponse[]>;
  removeMember: (userId: string) => Promise<void>;
  updateMemberRole: (userId: string, roleName: TenantRole) => Promise<void>;
  getInvitations: () => Promise<TenantInvitationResponse[]>;
  invite: (invitee: string[], roleName: TenantRole) => Promise<void>;
  resendInvitation: (invitationId: string) => Promise<void>;
  revokeInvitation: (invitationId: string) => Promise<void>;
  deleteInvitation: (invitationId: string) => Promise<void>;
};

/** Logto Cloud holds the members and invitations of every Cloud tenant. */
const useCloudTenantMembersApi = (): TenantMembersApi => {
  const cloudApi = useAuthedCloudApi();
  const { currentTenantId: tenantId } = useContext(TenantsContext);

  return useMemo(
    () => ({
      membersKey: `api/tenants/${tenantId}/members`,
      invitationsKey: `api/tenants/${tenantId}/invitations`,
      getMembers: async () =>
        cloudApi.get('/api/tenants/:tenantId/members', { params: { tenantId } }),
      removeMember: async (userId) => {
        await cloudApi.delete('/api/tenants/:tenantId/members/:userId', {
          params: { tenantId, userId },
        });
      },
      updateMemberRole: async (userId, roleName) => {
        await cloudApi.put('/api/tenants/:tenantId/members/:userId/roles', {
          params: { tenantId, userId },
          body: { roleName },
        });
      },
      getInvitations: async () =>
        cloudApi.get('/api/tenants/:tenantId/invitations', { params: { tenantId } }),
      invite: async (invitee, roleName) => {
        await cloudApi.post('/api/tenants/:tenantId/invitations', {
          params: { tenantId },
          body: { invitee, roleName },
        });
      },
      resendInvitation: async (invitationId) => {
        await cloudApi.post('/api/tenants/:tenantId/invitations/:invitationId/message', {
          params: { tenantId, invitationId },
        });
      },
      revokeInvitation: async (invitationId) => {
        await cloudApi.patch('/api/tenants/:tenantId/invitations/:invitationId/status', {
          params: { tenantId, invitationId },
          body: { status: OrganizationInvitationStatus.Revoked },
        });
      },
      deleteInvitation: async (invitationId) => {
        await cloudApi.delete('/api/tenants/:tenantId/invitations/:invitationId', {
          params: { tenantId, invitationId },
        });
      },
    }),
    [cloudApi, tenantId]
  );
};

/**
 * A self-hosted deployment holds the members and invitations of its only tenant in its admin
 * tenant, behind the same `/me` routes as its other tenant settings.
 */
const useOssTenantMembersApi = (): TenantMembersApi => {
  const api = useStaticApi({ prefixUrl: adminTenantEndpoint, resourceIndicator: meApi.indicator });

  return useMemo(
    () => ({
      membersKey: 'me/tenant/members',
      invitationsKey: 'me/tenant/invitations',
      getMembers: async () => api.get('me/tenant/members').json<TenantMemberResponse[]>(),
      removeMember: async (userId) => {
        await api.delete(`me/tenant/members/${encodeURIComponent(userId)}`);
      },
      updateMemberRole: async (userId, roleName) => {
        await api.put(`me/tenant/members/${encodeURIComponent(userId)}/roles`, {
          json: { roleName },
        });
      },
      getInvitations: async () =>
        api.get('me/tenant/invitations').json<TenantInvitationResponse[]>(),
      invite: async (invitee, roleName) => {
        await api.post('me/tenant/invitations', { json: { invitee, roleName } });
      },
      resendInvitation: async (invitationId) => {
        await api.post(`me/tenant/invitations/${encodeURIComponent(invitationId)}/message`);
      },
      revokeInvitation: async (invitationId) => {
        await api.patch(`me/tenant/invitations/${encodeURIComponent(invitationId)}/status`, {
          json: { status: OrganizationInvitationStatus.Revoked },
        });
      },
      deleteInvitation: async (invitationId) => {
        await api.delete(`me/tenant/invitations/${encodeURIComponent(invitationId)}`);
      },
    }),
    [api]
  );
};

const useTenantMembersApi = isCloud ? useCloudTenantMembersApi : useOssTenantMembersApi;

export default useTenantMembersApi;
