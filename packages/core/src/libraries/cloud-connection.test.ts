import { GlobalValues } from '@logto/shared';
import { createMockUtils } from '@logto/shared/esm';
import nock from 'nock';

import { mockLogtoConfigsLibrary } from '#src/test-utils/mock-libraries.js';

import { type LogtoConfigLibrary } from './logto-config.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

const adminEndpoint = 'http://mock.com';
const mockAccessToken = 'mockAccessToken';
await mockEsmWithActual('#src/env-set/index.js', () => ({
  EnvSet: {
    get values() {
      const values = new GlobalValues();

      return {
        ...values,
        adminUrlSet: {
          ...values.adminUrlSet,
          endpoint: new URL(adminEndpoint),
        },
      };
    },
  },
}));

const { createCloudConnectionLibrary } = await import('./cloud-connection.js');

const logtoConfigs: LogtoConfigLibrary = {
  ...mockLogtoConfigsLibrary,
  getCloudConnectionData: jest.fn().mockResolvedValue({
    appId: 'appId',
    appSecret: 'appSecret',
    resource: 'resource',
  }),
};

describe('getAccessToken()', () => {
  const { getAccessToken } = createCloudConnectionLibrary(logtoConfigs);

  it('should get access token and cached', async () => {
    nock(adminEndpoint).post('/oidc/token').reply(200, {
      access_token: mockAccessToken,
      expires_in: 3600,
      token_type: 'Bearer',
    });
    const token = await getAccessToken();
    expect(token).toBe(mockAccessToken);

    nock(adminEndpoint).post('/oidc/token').reply(200, {
      access_token: 'anotherAccessToken',
      expires_in: 3600,
      token_type: 'Bearer',
    });
    const cachedToken = await getAccessToken();
    expect(cachedToken).toBe(mockAccessToken);
  });
});
