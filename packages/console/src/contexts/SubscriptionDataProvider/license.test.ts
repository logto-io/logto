import { LicenseEnv, ReservedPlanId, ossDefaultQuota } from '@logto/schemas';

import { defaultSubscriptionQuota, defaultTenantResponse } from '@/consts/tenants';
import { type License } from '@/types/license';

import { buildSelfHostedSubscription, buildSelfHostedSubscriptionQuota } from './license';

jest.mock('@/consts/env', () => ({
  isCloud: false,
}));

// The tenant defaults pull in the region flags, which jest cannot resolve as `?react` SVG imports.
jest.mock('@/components/Region', () => ({ defaultRegionName: 'US' }));

const license: License = {
  plan: ReservedPlanId.SelfHostedPro,
  env: LicenseEnv.Production,
  quota: { ...ossDefaultQuota, hideLogtoBranding: true, samlApplicationsLimit: null },
  expiresAt: '2027-01-01T00:00:00.000Z',
  installedAt: '2026-01-01T00:00:00.000Z',
};

describe('buildSelfHostedSubscription', () => {
  it('falls back to the fixed dev plan without a license', () => {
    expect(buildSelfHostedSubscription()).toBe(defaultTenantResponse.subscription);
  });

  it('takes the plan and the period from the license', () => {
    expect(buildSelfHostedSubscription(license)).toStrictEqual({
      ...defaultTenantResponse.subscription,
      planId: ReservedPlanId.SelfHostedPro,
      currentPeriodStart: new Date('2026-01-01T00:00:00.000Z'),
      currentPeriodEnd: new Date('2027-01-01T00:00:00.000Z'),
    });
  });

  it('never marks a licensed deployment as an enterprise plan', () => {
    expect(
      buildSelfHostedSubscription({ ...license, plan: ReservedPlanId.SelfHostedEnterprise })
    ).toMatchObject({ planId: ReservedPlanId.SelfHostedEnterprise, isEnterprisePlan: false });
  });
});

describe('buildSelfHostedSubscriptionQuota', () => {
  it('applies the OSS default SAML cap without a license', () => {
    expect(buildSelfHostedSubscriptionQuota()).toStrictEqual({
      ...defaultSubscriptionQuota,
      samlApplicationsLimit: ossDefaultQuota.samlApplicationsLimit,
    });
  });

  it('carries the SAML cap over from the license and nothing else', () => {
    expect(buildSelfHostedSubscriptionQuota(license)).toStrictEqual({
      ...defaultSubscriptionQuota,
      samlApplicationsLimit: null,
    });
  });
});
