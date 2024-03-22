import { SsoProviderName } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';

import { mockSsoConnector } from '#src/__mocks__/sso.js';
import RequestError from '#src/errors/RequestError/index.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);
const fetchOidcConfig = jest.fn();

await mockEsmWithActual('#src/sso/OidcConnector/utils.js', () => ({
  fetchOidcConfig,
}));

const { ssoConnectorFactories } = await import('#src/sso/index.js');
const { parseFactoryDetail, fetchConnectorProviderDetails, validateConnectorDomains } =
  await import('./utils.js');

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
    const result = await fetchConnectorProviderDetails(connector, mockTenantId, 'en');

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
    const result = await fetchConnectorProviderDetails(connector, mockTenantId, 'en');

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
    const result = await fetchConnectorProviderDetails(connector, mockTenantId, 'en');

    expect(result).toMatchObject(
      expect.objectContaining({
        ...connector,
        providerLogo: ssoConnectorFactories[connector.providerName].logo,
        providerLogoDark: ssoConnectorFactories[connector.providerName].logoDark,
        providerConfig: {
          ...connector.config,
          scope: 'openid profile email', // Default scope
          tokenEndpoint: 'http://example.com/token',
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
