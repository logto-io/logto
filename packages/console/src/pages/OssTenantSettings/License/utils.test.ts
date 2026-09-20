import { LicenseEnv } from '@logto/schemas';
import type { TFuncKey } from 'i18next';

import { buildLicensePurchaseUrl, isLicenseInstallErrorCode, licenseEnvPhraseKeys } from './utils';

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
