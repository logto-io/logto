import { LicenseEnv, LicenseUsageMetric } from '@logto/schemas';
import type { TFuncKey } from 'i18next';

import {
  buildLicenseManagementUrl,
  buildLicensePurchaseUrl,
  buildUsageStatementCsv,
  formatUsageMonth,
  getLicenseRefusalReasonPhraseKey,
  getLicenseStatus,
  getPreviousUsageMonth,
  getUsageWarning,
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
  it('keeps the existing contact flow with refresh attribution until self-service ships', () => {
    const url = new URL(buildLicenseManagementUrl());

    expect(url.origin).toBe('https://logto.io');
    expect(url.pathname).toBe('/self-hosted-plans');
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

describe('getUsageWarning', () => {
  const warnings = [
    { metric: LicenseUsageMetric.Mau, limit: 50_000, value: 60_000 },
    { metric: LicenseUsageMetric.ProductionDeployments, limit: 1, value: 2 },
  ];

  it('finds the warning of a metric', () => {
    expect(getUsageWarning(warnings, LicenseUsageMetric.ProductionDeployments)).toEqual({
      metric: LicenseUsageMetric.ProductionDeployments,
      limit: 1,
      value: 2,
    });
  });

  it.each([undefined, []])('answers undefined without a warning (%p)', (value) => {
    expect(getUsageWarning(value, LicenseUsageMetric.Mau)).toBeUndefined();
  });
});

describe('formatUsageMonth', () => {
  it('formats a usage month in the given language', () => {
    expect(formatUsageMonth('2026-10', 'en')).toBe('October 2026');
    expect(formatUsageMonth('2026-10', 'zh-CN')).toBe('2026年10月');
  });
});

describe('getPreviousUsageMonth', () => {
  it.each([
    ['2026-10', '2026-09'],
    ['2026-01', '2025-12'],
  ])('answers %s before %s', (month, expected) => {
    expect(getPreviousUsageMonth(month)).toBe(expected);
  });
});

describe('buildUsageStatementCsv', () => {
  it('builds one row per month with the localized headers', () => {
    expect(
      buildUsageStatementCsv(
        [
          { month: '2025-11', mau: 1200, monthlyAccessTokens: 3400 },
          { month: '2025-12', mau: 0, monthlyAccessTokens: 0 },
        ],
        { month: 'Month', mau: 'Monthly active users', monthlyAccessTokens: 'Access tokens' }
      )
    ).toBe(
      ['Month,Monthly active users,Access tokens', '2025-11,1200,3400', '2025-12,0,0'].join('\n')
    );
  });

  it('quotes values that contain a comma or a quote', () => {
    expect(
      buildUsageStatementCsv([], {
        month: 'Month',
        mau: 'Active, users',
        monthlyAccessTokens: 'Say "hello"',
      })
    ).toBe('Month,"Active, users","Say ""hello"""');
  });
});
