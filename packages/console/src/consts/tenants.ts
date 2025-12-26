import { ReservedPlanId, TenantTag, defaultManagementApi } from '@logto/schemas';
import dayjs from 'dayjs';

import {
  type SubscriptionQuota,
  type LogtoSkuResponse,
  type TenantResponse,
  type SubscriptionCountBasedUsage,
} from '@/cloud/types/router';
import { defaultRegionName } from '@/components/Region';
import { LogtoSkuType } from '@/types/skus';

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
    isEnterprisePlan: false,
    quotaScope: 'dedicated',
  },
  usage: {
    activeUsers: 0,
    tokenUsage: 0,
    userTokenUsage: 0,
    m2mTokenUsage: 0,
  },
  quota: {
    mauLimit: null,
    tokenLimit: null,
  },
  openInvoices: [],
  isSuspended: false,
  planId: defaultSubscriptionPlanId, // Reserved for compatibility with cloud
  regionName: defaultRegionName, // Reserved for compatibility with cloud
  createdAt: new Date(),
};

/**
 * - For cloud, the initial tenant's subscription plan will be fetched from the cloud API.
 * - OSS has a fixed subscription plan with `development` id and no cloud API to dynamically fetch the subscription plan.
 */
export const defaultLogtoSku: LogtoSkuResponse = {
  id: ReservedPlanId.Development,
  name: 'Logto Development plan',
  createdAt: new Date(),
  updatedAt: new Date(),
  type: LogtoSkuType.Basic,
  unitPrice: 0,
  productId: null,
  defaultPriceId: null,
  isDefault: true,
  isDevPlan: true,
  quota: {
    // A soft limit for abuse monitoring
    mauLimit: 100,
    tokenLimit: null,
    applicationsLimit: null,
    machineToMachineLimit: null,
    resourcesLimit: null,
    scopesPerResourceLimit: null,
    socialConnectorsLimit: null,
    userRolesLimit: null,
    machineToMachineRolesLimit: null,
    scopesPerRoleLimit: null,
    hooksLimit: null,
    auditLogsRetentionDays: 14,
    mfaEnabled: true,
    organizationsLimit: null,
    enterpriseSsoLimit: null,
    thirdPartyApplicationsLimit: null,
    tenantMembersLimit: 20,
    customJwtEnabled: true,
    subjectTokenEnabled: true,
    bringYourUiEnabled: true,
    collectUserProfileEnabled: true,
    idpInitiatedSsoEnabled: false,
    securityFeaturesEnabled: true,
  },
};

/** Quota for Free plan */
export const defaultSubscriptionQuota: SubscriptionQuota = {
  mauLimit: 50_000,
  tokenLimit: 500_000,
  applicationsLimit: 3,
  machineToMachineLimit: 1,
  resourcesLimit: 1,
  scopesPerResourceLimit: 1,
  socialConnectorsLimit: 3,
  userRolesLimit: 1,
  machineToMachineRolesLimit: 1,
  scopesPerRoleLimit: 1,
  hooksLimit: 1,
  auditLogsRetentionDays: 3,
  mfaEnabled: false,
  organizationsLimit: 0,
  enterpriseSsoLimit: 0,
  thirdPartyApplicationsLimit: 0,
  tenantMembersLimit: 1,
  customJwtEnabled: false,
  subjectTokenEnabled: false,
  bringYourUiEnabled: false,
  collectUserProfileEnabled: false,
  idpInitiatedSsoEnabled: false,
  samlApplicationsLimit: 0,
  securityFeaturesEnabled: false,
  customDomainsLimit: 1,
};

export const defaultSubscriptionUsage: SubscriptionCountBasedUsage = {
  applicationsLimit: 0,
  machineToMachineLimit: 0,
  resourcesLimit: 0,
  scopesPerResourceLimit: 0,
  socialConnectorsLimit: 0,
  userRolesLimit: 0,
  machineToMachineRolesLimit: 0,
  scopesPerRoleLimit: 0,
  hooksLimit: 0,
  mfaEnabled: false,
  organizationsLimit: 0,
  enterpriseSsoLimit: 0,
  thirdPartyApplicationsLimit: 0,
  tenantMembersLimit: 0,
  customJwtEnabled: false,
  bringYourUiEnabled: false,
  collectUserProfileEnabled: false,
  idpInitiatedSsoEnabled: false,
  samlApplicationsLimit: 0,
  securityFeaturesEnabled: false,
  customDomainsLimit: 0,
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

// The threshold days to show the convert to production card in the get started page
export const convertToProductionThresholdDays = 7;
