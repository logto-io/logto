import { type SsoConnector } from '@logto/schemas';

import { mockSsoConnector, wellConfiguredSsoConnector } from '#src/__mocks__/sso.js';
import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import { OidcSsoConnector } from '#src/sso/OidcSsoConnector/index.js';
import { ssoConnectorFactories } from '#src/sso/index.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const getAuthorizationUrlMock = jest.fn();

class MockOidcSsoConnector extends OidcSsoConnector {
  override getAuthorizationUrl = getAuthorizationUrlMock;
}

jest
  .spyOn(ssoConnectorFactories.OIDC, 'constructor')
  .mockImplementation((data: SsoConnector) => new MockOidcSsoConnector(data));

const { getSsoAuthorizationUrl } = await import('./single-sign-on.js');

describe('Single sign on util methods tests', () => {
  const mockContext: WithLogContext = {
    ...createContextWithRouteParameters(),
    ...createMockLogContext(),
  };

  const mockProvider = createMockProvider();
  const tenant = new MockTenant(mockProvider);

  describe('getSsoAuthorizationUrl tests', () => {
    it('should throw an error if the connector config is invalid', async () => {
      await expect(getSsoAuthorizationUrl(mockContext, tenant, mockSsoConnector)).rejects.toThrow(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        expect.objectContaining({ status: 500, code: `connector.invalid_config` })
      );
    });

    it('should throw an error if OIDC connector is used without a proper payload', async () => {
      await expect(
        getSsoAuthorizationUrl(mockContext, tenant, wellConfiguredSsoConnector)
      ).rejects.toThrow(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        expect.objectContaining({ status: 400, code: 'session.insufficient_info' })
      );
    });

    it('should call the connector getAuthorizationUrl method', async () => {
      getAuthorizationUrlMock.mockResolvedValueOnce('https://example.com');

      await expect(
        getSsoAuthorizationUrl(mockContext, tenant, wellConfiguredSsoConnector, {
          state: 'state',
          redirectUri: 'https://example.com',
        })
      ).resolves.toBe('https://example.com');
    });
  });
});
