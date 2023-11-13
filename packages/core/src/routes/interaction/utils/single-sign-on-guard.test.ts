import { wellConfiguredSsoConnector } from '#src/__mocks__/sso.js';
import RequestError from '#src/errors/RequestError/index.js';
import { type SsoConnectorLibrary } from '#src/libraries/sso-connector.js';

import { verifySsoOnlyEmailIdentifier } from './single-sign-on-guard.js';

const { jest } = import.meta;

const getAvailableSsoConnectorsMock = jest.fn();

const mockSsoConnectorLibrary: SsoConnectorLibrary = {
  getAvailableSsoConnectors: getAvailableSsoConnectorsMock,
  getSsoConnectors: jest.fn(),
  getSsoConnectorById: jest.fn(),
};

describe('verifyEmailIdentifier tests', () => {
  it('should return if the identifier is not an email', async () => {
    await expect(
      verifySsoOnlyEmailIdentifier(mockSsoConnectorLibrary, {
        username: 'foo',
        password: 'bar',
      })
    ).resolves.not.toThrow();
  });
  it('should return if no sso connectors found with the given email', async () => {
    getAvailableSsoConnectorsMock.mockResolvedValueOnce([
      {
        ...wellConfiguredSsoConnector,
        domains: ['example.com'],
      },
    ]);

    await expect(
      verifySsoOnlyEmailIdentifier(mockSsoConnectorLibrary, {
        email: 'foo@bar.com',
        password: 'bar',
      })
    ).resolves.not.toThrow();
  });

  it('should throw an error if multiple sso connectors found with the given email', async () => {
    const connector = {
      ...wellConfiguredSsoConnector,
      domains: ['example.com'],
    };

    getAvailableSsoConnectorsMock.mockResolvedValueOnce([connector]);

    await expect(
      verifySsoOnlyEmailIdentifier(mockSsoConnectorLibrary, {
        email: 'foo@example.com',
        verificationCode: 'bar',
      })
    ).rejects.toMatchError(
      new RequestError(
        {
          code: 'session.sso_enabled',
          status: 422,
        },
        {
          ssoConnectors: [connector],
        }
      )
    );
  });
});
