import { LicenseEnv } from '@logto/schemas';
import type { TFuncKey } from 'i18next';

import {
  buildLicenseManagementUrl,
  buildLicensePurchaseUrl,
  getLicenseRefusalReasonPhraseKey,
  getLicenseStatus,
  isLicenseInstallErrorCode,
  licenseEnvPhraseKeys,
} from './utils';

const license = {
  expiresAt: '2026-09-20T00:00:00.000Z',
  graceEndsAt: '2026-10-20T00:00:00.000Z',
  refusalReason: undefined,
} as const;

describe('isLicenseInstallErrorCode', () => {
  it.each(['license.invalid_key', 'license.expired_key'])(
    'answers %s on the form',
    (errorCode: string) => {
      expect(isLicenseInstallErrorCode(errorCode)).toBe(true);
    }
  );

  it.each(['license.not_installed', 'request.general'])(
    'leaves %s to the global error handling',
    (errorCode: string) => {
      expect(isLicenseInstallErrorCode(errorCode)).toBe(false);
    }
  );
});

describe('buildLicensePurchaseUrl', () => {
  it('points at the self-hosted plans page with its own attribution', () => {
    const url = new URL(buildLicensePurchaseUrl());

    expect(url.origin).toBe('https://logto.io');
    expect(url.pathname).toBe('/self-hosted-plans');
    expect(url.searchParams.get('utm_source')).toBe('logto_oss');
    expect(url.searchParams.get('utm_medium')).toBe('console');
    expect(url.searchParams.get('utm_campaign')).toBe('self_hosted_plans');
    expect(url.searchParams.get('utm_content')).toBe('tenant_settings_license_page');
  });
});

describe('buildLicenseManagementUrl', () => {
  it('points at the Cloud self-hosted licenses page with refresh attribution', () => {
    const url = new URL(buildLicenseManagementUrl());

    expect(url.origin).toBe('https://cloud.logto.io');
    expect(url.pathname).toBe('/self-hosted-licenses');
    expect(url.searchParams.get('utm_content')).toBe('tenant_settings_license_refresh');
  });
});

describe('getLicenseStatus', () => {
  it.each([
    ['active', { now: Date.parse('2026-09-19T00:00:00.000Z') }],
    ['refresh_required', { now: Date.parse('2026-09-21T00:00:00.000Z') }],
    ['grace_expired', { now: Date.parse('2026-10-21T00:00:00.000Z') }],
  ] as const)('returns %s for the corresponding date', (status, { now }) => {
    expect(getLicenseStatus(license, now)).toBe(status);
  });

  it('prioritizes a refused refresh over an expired key while grace remains', () => {
    expect(
      getLicenseStatus({ ...license, refusalReason: 'canceled' }, Date.parse('2026-09-21'))
    ).toBe('refresh_required');
  });
});

describe('getLicenseRefusalReasonPhraseKey', () => {
  it.each(['canceled', 'unpaid', 'expired', 'revoked'])('maps %s to a phrase', (reason) => {
    expect(getLicenseRefusalReasonPhraseKey(reason)).toBe(
      `tenants.license.refusal_reason_${reason}`
    );
  });

  it('uses a generic phrase for an unknown reason', () => {
    expect(getLicenseRefusalReasonPhraseKey('unknown')).toBe(
      'tenants.license.refusal_reason_unknown'
    );
  });
});

describe('licenseEnvPhraseKeys', () => {
  it('names every environment a key can declare', () => {
    const phraseKeys: Record<
      LicenseEnv,
      TFuncKey<'translation', 'admin_console'>
    > = licenseEnvPhraseKeys;

    expect(phraseKeys).toEqual({
      [LicenseEnv.Production]: 'tenants.license.environment_production',
      [LicenseEnv.NonProduction]: 'tenants.license.environment_non_production',
    });
  });
});
