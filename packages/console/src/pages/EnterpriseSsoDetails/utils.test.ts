import { SsoProviderType } from '@logto/schemas';

import { shouldShowIdpInitiatedAuthTab, shouldShowIdpInitiatedAuthUpsell } from './utils';

describe('shouldShowIdpInitiatedAuthTab', () => {
  it('returns true for Cloud SAML connectors when IdP-initiated SSO is entitled', () => {
    expect(
      shouldShowIdpInitiatedAuthTab({
        isCloud: true,
        providerType: SsoProviderType.SAML,
        isIdpInitiatedSsoEnabled: true,
      })
    ).toBe(true);
  });

  it('returns true for OSS SAML connectors', () => {
    expect(
      shouldShowIdpInitiatedAuthTab({
        isCloud: false,
        providerType: SsoProviderType.SAML,
        isIdpInitiatedSsoEnabled: false,
      })
    ).toBe(true);
  });

  it('returns false for non-SAML connectors', () => {
    expect(
      shouldShowIdpInitiatedAuthTab({
        isCloud: false,
        providerType: SsoProviderType.OIDC,
        isIdpInitiatedSsoEnabled: false,
      })
    ).toBe(false);
  });
});

describe('shouldShowIdpInitiatedAuthUpsell', () => {
  it('returns true for OSS', () => {
    expect(
      shouldShowIdpInitiatedAuthUpsell({
        isCloud: false,
        isIdpInitiatedSsoEnabled: false,
      })
    ).toBe(true);
  });

  it('returns false on Cloud even when the quota is entitled', () => {
    expect(
      shouldShowIdpInitiatedAuthUpsell({
        isCloud: true,
        isIdpInitiatedSsoEnabled: true,
      })
    ).toBe(false);
  });
});
