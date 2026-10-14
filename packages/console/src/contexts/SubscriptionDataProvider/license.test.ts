import { LicenseEnv, ReservedPlanId, ossDefaultQuota } from '@logto/schemas';

import { defaultSubscriptionQuota, defaultTenantResponse } from '@/consts/tenants';
import { type License } from '@/types/license';
import { getEffectiveLicenseQuota } from '@/utils/license';

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
  lastRefreshedAt: '2026-01-01T00:00:00.000Z',
  graceEndsAt: '2026-01-31T00:00:00.000Z',
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
    expect(buildSelfHostedSubscriptionQuota(getEffectiveLicenseQuota())).toStrictEqual({
      ...defaultSubscriptionQuota,
      samlApplicationsLimit: ossDefaultQuota.samlApplicationsLimit,
    });
  });

  it('carries the SAML cap over from the license and nothing else', () => {
    expect(
      buildSelfHostedSubscriptionQuota(getEffectiveLicenseQuota(license, Date.parse('2026-01-30')))
    ).toStrictEqual({
      ...defaultSubscriptionQuota,
      samlApplicationsLimit: null,
    });
  });

  it('restores the OSS SAML cap at grace expiry, even if the key has not expired', () => {
    expect(
      buildSelfHostedSubscriptionQuota(
        getEffectiveLicenseQuota(license, Date.parse(license.graceEndsAt))
      )
    ).toStrictEqual({ ...defaultSubscriptionQuota, samlApplicationsLimit: 3 });
  });
});

describe('getEffectiveLicenseQuota', () => {
  const fullLicense: License = {
    ...license,
    quota: {
      hideLogtoBranding: true,
      bringYourUi: true,
      idpInitiatedSso: true,
      consoleCollaboration: true,
      mandatoryMfa: true,
      hostedEmail: false,
      samlApplicationsLimit: null,
    },
  };
  const graceEndsAt = Date.parse(fullLicense.graceEndsAt);

  it('keeps the licensed quota immediately before grace ends', () => {
    expect(getEffectiveLicenseQuota(fullLicense, graceEndsAt - 1)).toEqual(fullLicense.quota);
  });

  it.each([0, 1])('falls back to OSS defaults %i ms after grace ends', (offset) => {
    expect(getEffectiveLicenseQuota(fullLicense, graceEndsAt + offset)).toEqual({
      hideLogtoBranding: false,
      bringYourUi: false,
      idpInitiatedSso: false,
      consoleCollaboration: false,
      mandatoryMfa: false,
      hostedEmail: false,
      samlApplicationsLimit: 3,
    });
    expect(fullLicense.quota.bringYourUi).toBe(true);
  });

  it('honors an expired key and a refused refresh while still inside grace', () => {
    expect(
      getEffectiveLicenseQuota(
        { ...fullLicense, expiresAt: '2026-01-15T00:00:00.000Z', refusalReason: 'revoked' },
        graceEndsAt - 1
      )
    ).toEqual(fullLicense.quota);
  });
});
