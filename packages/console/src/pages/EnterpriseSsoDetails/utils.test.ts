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
  it('returns false on Cloud', () => {
    expect(
      shouldShowIdpInitiatedAuthUpsell({
        isCloud: true,
        isIdpInitiatedSsoLicensed: false,
      })
    ).toBe(false);
  });

  it('returns true for OSS without a license granting IdP-initiated SSO', () => {
    expect(
      shouldShowIdpInitiatedAuthUpsell({
        isCloud: false,
        isIdpInitiatedSsoLicensed: false,
      })
    ).toBe(true);
  });

  it('returns false for OSS with a license granting IdP-initiated SSO', () => {
    expect(
      shouldShowIdpInitiatedAuthUpsell({
        isCloud: false,
        isIdpInitiatedSsoLicensed: true,
      })
    ).toBe(false);
  });
});
