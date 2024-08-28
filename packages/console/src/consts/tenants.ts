import { ReservedPlanId, TenantTag, defaultManagementApi } from '@logto/schemas';
import dayjs from 'dayjs';

import { type TenantResponse } from '@/cloud/types/router';
import { RegionName } from '@/components/Region';
import { type SubscriptionPlan } from '@/types/subscriptions';

import { adminEndpoint, isCloud } from './env';

const { tenantId, indicator } = defaultManagementApi.resource;

const defaultSubscriptionPlanId = ReservedPlanId.Development;

/**
 * - For cloud, the initial tenants data is empty, and it will be fetched from the cloud API.
 * - OSS has a fixed tenant with ID `default` and no cloud API to dynamically fetch tenants.
 */
export const defaultTenantResponse: TenantResponse = {
  id: tenantId,
  name: `tenant_${tenantId}`,
  tag: TenantTag.Development,
  indicator,
  subscription: {
    status: 'active',
    planId: defaultSubscriptionPlanId,
    currentPeriodStart: dayjs().toDate(),
    currentPeriodEnd: dayjs().add(1, 'month').toDate(),
  },
  usage: {
    activeUsers: 0,
    cost: 0,
    tokenUsage: 0,
  },
  openInvoices: [],
  isSuspended: false,
  planId: defaultSubscriptionPlanId, // Reserved for compatibility with cloud
  regionName: RegionName.EU, // Reserved for compatibility with cloud
  createdAt: new Date(),
};

/**
 * - For cloud, the initial tenant's subscription plan will be fetched from the cloud API.
 * - OSS has a fixed subscription plan with `development` id and no cloud API to dynamically fetch the subscription plan.
 */
export const defaultSubscriptionPlan: SubscriptionPlan = {
  id: defaultSubscriptionPlanId,
  name: 'Development',
  createdAt: new Date(),
  updatedAt: new Date(),
  stripeProducts: [],
  quota: {
    mauLimit: null,
    tokenLimit: null,
    applicationsLimit: null,
    machineToMachineLimit: null,
    resourcesLimit: null,
    scopesPerResourceLimit: null,
    customDomainEnabled: true,
    mfaEnabled: true,
    omniSignInEnabled: true,
    socialConnectorsLimit: null,
    standardConnectorsLimit: null,
    rolesLimit: null,
    machineToMachineRolesLimit: null,
    scopesPerRoleLimit: null,
    auditLogsRetentionDays: null,
    hooksLimit: null,
    organizationsEnabled: true,
    ssoEnabled: true,
    ticketSupportResponseTime: 48,
    thirdPartyApplicationsLimit: null,
    tenantMembersLimit: null,
    customJwtEnabled: true,
  },
};

const getAdminTenantEndpoint = () => {
  // Allow endpoint override for dev or testing
  if (adminEndpoint) {
    return new URL(adminEndpoint);
  }

  return new URL(
    isCloud ? window.location.origin.replace('cloud.', 'auth.') : window.location.origin
  );
};

export const adminTenantEndpoint = getAdminTenantEndpoint();

export const mainTitle = isCloud ? 'Logto Cloud' : 'Logto Console';
