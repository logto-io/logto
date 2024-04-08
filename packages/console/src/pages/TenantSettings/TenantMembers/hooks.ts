import { OrganizationInvitationStatus } from '@logto/schemas';
import { useContext, useMemo } from 'react';
import useSWR from 'swr';

import { useAuthedCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type TenantInvitationResponse, type TenantMemberResponse } from '@/cloud/types/router';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';
import { type RequestError } from '@/hooks/use-api';
import useCurrentTenantScopes from '@/hooks/use-current-tenant-scopes';
import { hasReachedQuotaLimit, hasSurpassedQuotaLimit } from '@/utils/quota';

const useTenantMembersUsage = () => {
  const { currentPlan } = useContext(SubscriptionDataContext);
  const { currentTenantId } = useContext(TenantsContext);
  const { canInviteMember } = useCurrentTenantScopes();

  const cloudApi = useAuthedCloudApi();

  const { data: members } = useSWR<TenantMemberResponse[], RequestError>(
    `api/tenants/:tenantId/members`,
    async () =>
      cloudApi.get('/api/tenants/:tenantId/members', { params: { tenantId: currentTenantId } })
  );
  const { data: invitations } = useSWR<TenantInvitationResponse[], RequestError>(
    canInviteMember && 'api/tenants/:tenantId/invitations',
    async () =>
      cloudApi.get('/api/tenants/:tenantId/invitations', { params: { tenantId: currentTenantId } })
  );

  const pendingInvitations = useMemo(
    () => invitations?.filter(({ status }) => status === OrganizationInvitationStatus.Pending),
    [invitations]
  );

  const usage = useMemo(() => {
    return (members?.length ?? 0) + (pendingInvitations?.length ?? 0);
  }, [members?.length, pendingInvitations?.length]);

  const hasTenantMembersReachedLimit = useMemo(
    () =>
      hasReachedQuotaLimit({
        quotaKey: 'tenantMembersLimit',
        plan: currentPlan,
        usage,
      }),
    [currentPlan, usage]
  );

  const hasTenantMembersSurpassedLimit = useMemo(
    () =>
      hasSurpassedQuotaLimit({
        quotaKey: 'tenantMembersLimit',
        plan: currentPlan,
        usage,
      }),
    [currentPlan, usage]
  );

  return {
    hasTenantMembersReachedLimit,
    hasTenantMembersSurpassedLimit,
    usage,
    limit: currentPlan.quota.tenantMembersLimit ?? Number.POSITIVE_INFINITY,
  };
};

export default useTenantMembersUsage;
