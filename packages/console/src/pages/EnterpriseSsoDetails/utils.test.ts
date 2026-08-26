import { SsoProviderType } from '@logto/schemas';

import { shouldShowIdpInitiatedAuthTab, shouldShowIdpInitiatedAuthUpsell } from './utils';

describe('shouldShowIdpInitiatedAuthTab', () => {
  it('returns true for Cloud SAML connectors when IdP-initiated SSO is entitled', () => {
    expect(
      shouldShowIdpInitiatedAuthTab({
        isCloud: true,
        isDevFeaturesEnabled: true,
        providerType: SsoProviderType.SAML,
        isIdpInitiatedSsoEnabled: true,
      })
    ).toBe(true);
  });

  it('returns true for OSS SAML connectors when the self-hosted plans feature is enabled', () => {
    expect(
      shouldShowIdpInitiatedAuthTab({
        isCloud: false,
        isDevFeaturesEnabled: true,
        providerType: SsoProviderType.SAML,
        isIdpInitiatedSsoEnabled: false,
      })
    ).toBe(true);
  });

  it('returns false for OSS when the self-hosted plans feature is disabled', () => {
    expect(
      shouldShowIdpInitiatedAuthTab({
        isCloud: false,
        isDevFeaturesEnabled: false,
        providerType: SsoProviderType.SAML,
        isIdpInitiatedSsoEnabled: false,
      })
    ).toBe(false);
  });

  it('returns false for non-SAML connectors', () => {
    expect(
      shouldShowIdpInitiatedAuthTab({
        isCloud: false,
        isDevFeaturesEnabled: true,
        providerType: SsoProviderType.OIDC,
        isIdpInitiatedSsoEnabled: false,
      })
    ).toBe(false);
  });
});

describe('shouldShowIdpInitiatedAuthUpsell', () => {
  it('returns true for OSS when the self-hosted plans feature is enabled', () => {
    expect(
      shouldShowIdpInitiatedAuthUpsell({
        isCloud: false,
        isDevFeaturesEnabled: true,
        isIdpInitiatedSsoEnabled: false,
      })
    ).toBe(true);
  });

  it('returns false on Cloud even when the quota is entitled', () => {
    expect(
      shouldShowIdpInitiatedAuthUpsell({
        isCloud: true,
        isDevFeaturesEnabled: true,
        isIdpInitiatedSsoEnabled: true,
      })
    ).toBe(false);
  });
});
