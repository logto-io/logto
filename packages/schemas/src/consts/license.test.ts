import { describe, expect, it } from 'vitest';

import {
  LicenseEnv,
  licensePayloadGuard,
  licenseUsageGuard,
  licenseUsageWarningGuard,
  ossDefaultQuota,
  resolveLicenseQuota,
} from './license.js';
import { ReservedPlanId } from './subscriptions.js';

const validPayload = Object.freeze({
  plan: ReservedPlanId.SelfHostedPro,
  env: LicenseEnv.Production,
  customerId: 'cus_1234567890',
  licenseId: 'lic_1234567890',
  iat: 1_760_000_000,
  exp: 1_791_536_000,
  quota: {
    hideLogtoBranding: true,
    bringYourUi: true,
    idpInitiatedSso: true,
    consoleCollaboration: true,
    mandatoryMfa: true,
    hostedEmail: false,
    samlApplicationsLimit: null,
  },
});

describe('licensePayloadGuard', () => {
  it('parses a production Pro license payload', () => {
    expect(licensePayloadGuard.parse(validPayload)).toEqual(validPayload);
  });

  it('parses a non-production Enterprise license payload', () => {
    const payload = {
      ...validPayload,
      plan: ReservedPlanId.SelfHostedEnterprise,
      env: LicenseEnv.NonProduction,
    };

    expect(licensePayloadGuard.parse(payload)).toEqual(payload);
  });

  it('parses a payload carrying only the entitlements it changes', () => {
    const payload = { ...validPayload, quota: { hideLogtoBranding: true } };

    expect(licensePayloadGuard.parse(payload)).toEqual(payload);
  });

  it.each([ReservedPlanId.Free, ReservedPlanId.Pro202509, ReservedPlanId.Development])(
    'rejects the Cloud-only plan %s',
    (plan) => {
      expect(licensePayloadGuard.safeParse({ ...validPayload, plan }).success).toBe(false);
    }
  );

  it('rejects an unknown environment', () => {
    expect(licensePayloadGuard.safeParse({ ...validPayload, env: 'staging' }).success).toBe(false);
  });

  it.each([-1, 1.5, '3'])('rejects the SAML application limit %j', (samlApplicationsLimit) => {
    expect(
      licensePayloadGuard.safeParse({
        ...validPayload,
        quota: { ...validPayload.quota, samlApplicationsLimit },
      }).success
    ).toBe(false);
  });

  it('parses usage limits, keeping absent and `null` limits apart', () => {
    const payload = {
      ...validPayload,
      usageLimits: { mau: 50_000, productionDeployments: 1, monthlyAccessTokens: null },
    };

    expect(licensePayloadGuard.parse(payload)).toEqual(payload);
  });

  it('still parses a key signed before usage limits existed', () => {
    expect(licensePayloadGuard.parse(validPayload)).not.toHaveProperty('usageLimits');
  });

  it.each([{ mau: -1 }, { mau: 1.5 }, { mau: '50000' }, null])(
    'drops the usage limits %j instead of rejecting the key',
    (usageLimits) => {
      // Advisory limits must never invalidate the key and take the enforced quota with it.
      expect(licensePayloadGuard.parse({ ...validPayload, usageLimits })).toEqual(validPayload);
    }
  );

  it('strips unknown usage limits', () => {
    expect(
      licensePayloadGuard.parse({ ...validPayload, usageLimits: { mau: 1, seats: 5 } }).usageLimits
    ).toEqual({ mau: 1 });
  });

  it('strips unknown claims instead of rejecting them', () => {
    expect(licensePayloadGuard.parse({ ...validPayload, iss: 'https://logto.io' })).toEqual(
      validPayload
    );
  });
});

describe('ossDefaultQuota', () => {
  it('locks every feature and caps SAML applications at 3', () => {
    expect(ossDefaultQuota).toStrictEqual({
      hideLogtoBranding: false,
      bringYourUi: false,
      idpInitiatedSso: false,
      consoleCollaboration: false,
      mandatoryMfa: false,
      hostedEmail: false,
      samlApplicationsLimit: 3,
    });
  });
});

describe('resolveLicenseQuota', () => {
  it('falls back to the OSS defaults without a license', () => {
    expect(resolveLicenseQuota()).toStrictEqual(ossDefaultQuota);
  });

  it('applies every entitlement a license grants', () => {
    expect(resolveLicenseQuota(validPayload.quota)).toStrictEqual({
      hideLogtoBranding: true,
      bringYourUi: true,
      idpInitiatedSso: true,
      consoleCollaboration: true,
      mandatoryMfa: true,
      hostedEmail: false,
      samlApplicationsLimit: null,
    });
  });

  it('keeps the OSS default for an entitlement the license does not carry', () => {
    expect(resolveLicenseQuota({ hideLogtoBranding: true })).toStrictEqual({
      ...ossDefaultQuota,
      hideLogtoBranding: true,
    });
  });

  it('keeps an unlimited SAML application quota instead of falling back to the cap', () => {
    expect(resolveLicenseQuota({ samlApplicationsLimit: null }).samlApplicationsLimit).toBeNull();
  });

  it('applies a SAML application quota of 0', () => {
    expect(resolveLicenseQuota({ samlApplicationsLimit: 0 }).samlApplicationsLimit).toBe(0);
  });

  it('applies an explicitly disabled entitlement', () => {
    expect(resolveLicenseQuota({ hostedEmail: false }).hostedEmail).toBe(false);
  });
});

describe('licenseUsageGuard', () => {
  const usage = {
    month: '2026-10',
    mau: { lastMonth: 120, monthToDate: 40 },
    monthlyAccessTokens: { lastMonth: 9000, monthToDate: 3000 },
    tenants: 2,
  };

  it('parses a usage snapshot', () => {
    expect(licenseUsageGuard.parse(usage)).toEqual(usage);
  });

  it.each(['2026-1', '2026-10-01', 'October'])('rejects the month %j', (month) => {
    expect(licenseUsageGuard.safeParse({ ...usage, month }).success).toBe(false);
  });
});

describe('licenseUsageWarningGuard', () => {
  it('parses a warning about a metric this Logto does not know yet', () => {
    const warning = { metric: 'organizations', limit: 10, value: 11 };

    expect(licenseUsageWarningGuard.parse(warning)).toEqual(warning);
  });
});
