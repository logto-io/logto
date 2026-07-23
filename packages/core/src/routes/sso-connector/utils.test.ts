import { SsoProviderName } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';

import { mockSsoConnector } from '#src/__mocks__/sso.js';
import { getTenantEndpoint, EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);
const fetchOidcConfig = jest.fn();

await mockEsmWithActual('#src/sso/OidcConnector/utils.js', () => ({
  fetchOidcConfig,
}));

const { ssoConnectorFactories } = await import('#src/sso/index.js');
const {
  parseFactoryDetail,
  fetchConnectorProviderDetails,
  validateConnectorDomains,
  parseConnectorConfig,
  isSignAuthnRequestEnabled,
  stripGatedSigningConfigFields,
} = await import('./utils.js');

const mockTenantId = 'mock_tenant_id';

describe('parseFactoryDetail', () => {
  it.each(Object.values(SsoProviderName))('should return correct detail for %s', (providerName) => {
    const { logo, logoDark, description, name, providerType } = ssoConnectorFactories[providerName];
    const detail = parseFactoryDetail(ssoConnectorFactories[providerName], 'en');

    expect(detail).toEqual({
      providerName,
      providerType,
      logo,
      logoDark,
      description: description.en,
      name: name.en,
    });
  });

  it.each(Object.values(SsoProviderName))(
    'should return correct detail for %s with unknown locale',
    (providerName) => {
      const { logo, logoDark, description, name, providerType } =
        ssoConnectorFactories[providerName];
      const detail = parseFactoryDetail(ssoConnectorFactories[providerName], 'zh');

      expect(detail).toEqual({
        providerName,
        providerType,
        logo,
        logoDark,
        description: description.en,
        name: name.en,
      });
    }
  );
});

describe('fetchConnectorProviderDetails', () => {
  it('providerConfig should be undefined if connector config is invalid', async () => {
    const connector = { ...mockSsoConnector, config: { clientId: 'foo' } };
    const result = await fetchConnectorProviderDetails(
      connector,
      getTenantEndpoint(mockTenantId, EnvSet.values),
      'en'
    );

    expect(result).toMatchObject(
      expect.objectContaining({
        ...connector,
        providerLogo: ssoConnectorFactories[connector.providerName].logo,
      })
    );

    expect(fetchOidcConfig).not.toBeCalled();
  });

  it('providerConfig should be undefined if failed to fetch config', async () => {
    const connector = {
      ...mockSsoConnector,
      config: { clientId: 'foo', clientSecret: 'bar', issuer: 'http://example.com' },
    };

    fetchOidcConfig.mockRejectedValueOnce(new Error('mock-error'));
    const result = await fetchConnectorProviderDetails(
      connector,
      getTenantEndpoint(mockTenantId, EnvSet.values),
      'en'
    );

    expect(result).toMatchObject(
      expect.objectContaining({
        ...connector,
        providerLogo: ssoConnectorFactories[connector.providerName].logo,
      })
    );

    expect(fetchOidcConfig).toBeCalledWith(connector.config.issuer);
  });

  it('should return correct details for supported provider', async () => {
    const connector = {
      ...mockSsoConnector,
      config: { clientId: 'foo', clientSecret: 'bar', issuer: 'http://example.com' },
    };

    fetchOidcConfig.mockResolvedValueOnce({ tokenEndpoint: 'http://example.com/token' });
    const result = await fetchConnectorProviderDetails(
      connector,
      getTenantEndpoint(mockTenantId, EnvSet.values),
      'en'
    );

    expect(result).toMatchObject(
      expect.objectContaining({
        ...connector,
        name: 'OIDC',
        providerType: 'oidc',
        providerLogo: ssoConnectorFactories[connector.providerName].logo,
        providerLogoDark: ssoConnectorFactories[connector.providerName].logoDark,
        providerConfig: {
          ...connector.config,
          scope: 'openid profile email', // Default scope
          tokenEndpoint: 'http://example.com/token',
          trustUnverifiedEmail: false,
        },
      })
    );
  });
});

describe('validateConnectorDomains', () => {
  it('should directly return if domains are empty', () => {
    expect(() => {
      validateConnectorDomains([]);
    }).not.toThrow();
  });

  it('should throw error if domains are duplicated', () => {
    expect(() => {
      validateConnectorDomains(['foo.io', 'bar.io', 'foo.io']);
    }).toMatchError(
      new RequestError(
        { code: 'single_sign_on.duplicated_domains', status: 422 },
        {
          data: ['foo.io'],
        }
      )
    );
  });

  it('should throw error if domains are in the blacklist', () => {
    expect(() => {
      validateConnectorDomains(['foo.io', 'bar.io', 'gmail.com']);
    }).toMatchError(
      new RequestError(
        { code: 'single_sign_on.forbidden_domains', status: 422 },
        {
          data: ['gmail.com'],
        }
      )
    );
  });
});

describe('signed AuthnRequest config helpers', () => {
  const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;
  const setDevFeaturesEnabled = (enabled: boolean) => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', enabled);
  };

  const samlSigningConfig = {
    metadata: 'mock-metadata',
    signAuthnRequest: true,
    requestSignatureAlgorithm: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256',
  };

  afterAll(() => {
    setDevFeaturesEnabled(originalIsDevFeaturesEnabled);
  });

  describe('isSignAuthnRequestEnabled', () => {
    it('is true only when the config explicitly enables it', () => {
      expect(
        isSignAuthnRequestEnabled(parseConnectorConfig(SsoProviderName.SAML, samlSigningConfig))
      ).toBe(true);
      expect(
        isSignAuthnRequestEnabled(
          parseConnectorConfig(SsoProviderName.SAML, { metadata: 'mock-metadata' })
        )
      ).toBe(false);
      expect(isSignAuthnRequestEnabled()).toBe(false);
    });
  });

  describe('stripGatedSigningConfigFields', () => {
    it('passes the config through when dev features are on', () => {
      setDevFeaturesEnabled(true);
      const parsed = parseConnectorConfig(SsoProviderName.SAML, samlSigningConfig);
      expect(stripGatedSigningConfigFields(parsed)).toEqual(parsed);
    });

    it('strips the signing fields when dev features are off', () => {
      setDevFeaturesEnabled(false);
      const parsed = parseConnectorConfig(SsoProviderName.SAML, samlSigningConfig);
      expect(stripGatedSigningConfigFields(parsed)).toEqual({ metadata: 'mock-metadata' });
    });
  });
});
