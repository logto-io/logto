import { describe, expect, it } from 'vitest';

import { subscriptionGuard } from './subscription.js';

const quota = {
  mauLimit: 1000,
  applicationsLimit: null,
  thirdPartyApplicationsLimit: 5,
  scopesPerResourceLimit: 10,
  socialConnectorsLimit: null,
  userRolesLimit: 10,
  machineToMachineRolesLimit: 10,
  scopesPerRoleLimit: 10,
  hooksLimit: 3,
  auditLogsRetentionDays: 30,
  customJwtEnabled: false,
  actionsEnabled: false,
  subjectTokenEnabled: false,
  bringYourUiEnabled: false,
  collectUserProfileEnabled: false,
  passkeySignInEnabled: true,
  tokenLimit: null,
  hostedEmailLimit: 100,
  hostedEmailDailyLimit: 10,
  machineToMachineLimit: 1,
  resourcesLimit: 3,
  enterpriseSsoLimit: 0,
  consoleSsoConnectorLimit: 0,
  tenantMembersLimit: 3,
  mfaEnabled: true,
  organizationsEnabled: false,
  organizationsLimit: 0,
  idpInitiatedSsoEnabled: false,
  samlApplicationsLimit: 0,
  securityFeaturesEnabled: false,
  customDomainsLimit: 0,
};

const subscription = {
  planId: 'pro',
  currentPeriodStart: '2026-10-01T00:00:00.000Z',
  currentPeriodEnd: '2026-11-01T00:00:00.000Z',
  isEnterprisePlan: false,
  status: 'active',
  upcomingInvoice: null,
  quota,
  systemLimit: { applicationsLimit: 100 },
};

describe('subscriptionGuard', () => {
  it('accepts a subscription response shaped like the core cache guard', () => {
    expect(subscriptionGuard.parse(subscription)).toEqual(subscription);
  });

  it('rejects an unknown subscription status', () => {
    expect(() => subscriptionGuard.parse({ ...subscription, status: 'deleted' })).toThrow();
  });

  it('rejects a quota missing a required key', () => {
    const { mfaEnabled: _omitted, ...incompleteQuota } = quota;

    expect(() => subscriptionGuard.parse({ ...subscription, quota: incompleteQuota })).toThrow();
  });
});
