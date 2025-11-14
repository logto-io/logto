import { ReservedPlanId } from '@logto/schemas';

import { type CloudConnectionLibrary } from '#src/libraries/cloud-connection.js';
import { type Subscription } from '#src/utils/subscription/types.js';

const defaultSystemLimit: Subscription['systemLimit'] = {
  applicationsLimit: 100,
  machineToMachineLimit: 20,
  thirdPartyApplicationsLimit: 20,
  samlApplicationsLimit: 20,
  resourcesLimit: 100,
  scopesPerResourceLimit: 100,
  socialConnectorsLimit: 20,
  enterpriseSsoLimit: 100,
  userRolesLimit: 1000,
  machineToMachineRolesLimit: 100,
  organizationsLimit: 100_000,
  hooksLimit: 10,
  tenantMembersLimit: 100,
  usersPerOrganizationLimit: 1000,
  organizationUserRolesLimit: 1000,
  organizationMachineToMachineRolesLimit: 500,
  organizationScopesLimit: 1000,
};

export const mockGetCloudConnectionData: CloudConnectionLibrary['getCloudConnectionData'] =
  async () => ({
    resource: 'https://logto.dev',
    appId: 'appId',
    appSecret: 'appSecret',
    endpoint: 'https://logto.dev/api',
    tokenEndpoint: 'https://logto.dev/oidc/token',
  });

export const mockQuota = {
  mauLimit: 50_000,
  tokenLimit: 10_000,
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
  /** @deprecated */
  organizationsEnabled: false,
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

export const mockSubscriptionData: Subscription = {
  id: 'sub_123',
  currentPeriodEnd: '2022-01-01T00:00:00Z',
  currentPeriodStart: '2021-12-01T00:00:00Z',
  planId: ReservedPlanId.Free,
  isEnterprisePlan: false,
  quota: mockQuota,
  status: 'active',
  systemLimit: defaultSystemLimit,
};
