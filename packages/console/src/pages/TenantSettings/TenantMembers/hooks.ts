import { OrganizationInvitationStatus } from '@logto/schemas';
import { useContext, useMemo } from 'react';
import useSWR from 'swr';

import { useAuthedCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type TenantInvitationResponse, type TenantMemberResponse } from '@/cloud/types/router';
import { isDevFeaturesEnabled } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';
import { type RequestError } from '@/hooks/use-api';
import useCurrentTenantScopes from '@/hooks/use-current-tenant-scopes';
import {
  hasReachedQuotaLimit,
  hasReachedSubscriptionQuotaLimit,
  hasSurpassedQuotaLimit,
  hasSurpassedSubscriptionQuotaLimit,
} from '@/utils/quota';

const useTenantMembersUsage = () => {
  const { currentPlan, currentSubscriptionUsage, currentSubscriptionQuota } =
    useContext(SubscriptionDataContext);
  const { currentTenantId } = useContext(TenantsContext);
  const {
    access: { canInviteMember },
  } = useCurrentTenantScopes();

  const cloudApi = useAuthedCloudApi();

  const { data: members } = useSWR<TenantMemberResponse[], RequestError>(
    `api/tenants/${currentTenantId}/members`,
    async () =>
      cloudApi.get('/api/tenants/:tenantId/members', { params: { tenantId: currentTenantId } })
  );
  const { data: invitations } = useSWR<TenantInvitationResponse[], RequestError>(
    canInviteMember && `api/tenants/${currentTenantId}/invitations`,
    async () =>
      cloudApi.get('/api/tenants/:tenantId/invitations', { params: { tenantId: currentTenantId } })
  );

  const pendingInvitations = useMemo(
    () => invitations?.filter(({ status }) => status === OrganizationInvitationStatus.Pending),
    [invitations]
  );

  const usage = useMemo(() => {
    if (isDevFeaturesEnabled) {
      return currentSubscriptionUsage.tenantMembersLimit;
    }
    return (members?.length ?? 0) + (pendingInvitations?.length ?? 0);
  }, [members?.length, pendingInvitations?.length, currentSubscriptionUsage.tenantMembersLimit]);

  const hasTenantMembersReachedLimit = useMemo(
    () =>
      isDevFeaturesEnabled
        ? hasReachedSubscriptionQuotaLimit({
            quotaKey: 'tenantMembersLimit',
            quota: currentSubscriptionQuota,
            usage: currentSubscriptionUsage.tenantMembersLimit,
          })
        : hasReachedQuotaLimit({
            quotaKey: 'tenantMembersLimit',
            plan: currentPlan,
            usage,
          }),
    [currentPlan, usage, currentSubscriptionQuota, currentSubscriptionUsage.tenantMembersLimit]
  );

  const hasTenantMembersSurpassedLimit = useMemo(
    () =>
      isDevFeaturesEnabled
        ? hasSurpassedSubscriptionQuotaLimit({
            quotaKey: 'tenantMembersLimit',
            quota: currentSubscriptionQuota,
            usage: currentSubscriptionUsage.tenantMembersLimit,
          })
        : hasSurpassedQuotaLimit({
            quotaKey: 'tenantMembersLimit',
            plan: currentPlan,
            usage,
          }),
    [currentPlan, usage, currentSubscriptionQuota, currentSubscriptionUsage.tenantMembersLimit]
  );

  return {
    hasTenantMembersReachedLimit,
    hasTenantMembersSurpassedLimit,
    usage,
    limit:
      (isDevFeaturesEnabled
        ? currentSubscriptionQuota.tenantMembersLimit
        : currentPlan.quota.tenantMembersLimit) ?? Number.POSITIVE_INFINITY,
  };
};

export default useTenantMembersUsage;
