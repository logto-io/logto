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

describe('getWorkerAccessToken()', () => {
  const { getAccessToken, getWorkerAccessToken } = createCloudConnectionLibrary(logtoConfigs);
  const mockWorkerAccessToken = 'mockWorkerAccessToken';

  beforeEach(() => {
    // Drop interceptors the previous describe left unconsumed — nock matching is global FIFO.
    nock.cleanAll();
  });

  it('should mint the token for the worker resource and scope, cached separately', async () => {
    nock(adminEndpoint)
      .post(
        '/oidc/token',
        (body: Record<string, string>) =>
          body.resource === 'https://*.logto.workers.dev' &&
          body.scope === 'invoke:worker:script-run'
      )
      .reply(200, {
        access_token: mockWorkerAccessToken,
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'invoke:worker:script-run',
      });

    const token = await getWorkerAccessToken();
    expect(token).toBe(mockWorkerAccessToken);

    // The Cloud service token cache must not be shared — the audiences differ.
    nock(adminEndpoint)
      .post('/oidc/token', (body: Record<string, string>) => body.resource === 'resource')
      .reply(200, {
        access_token: mockAccessToken,
        expires_in: 3600,
        token_type: 'Bearer',
      });

    const cloudToken = await getAccessToken();
    expect(cloudToken).toBe(mockAccessToken);

    // Cached: no further request is mounted, so a miss would throw from nock.
    const cachedToken = await getWorkerAccessToken();
    expect(cachedToken).toBe(mockWorkerAccessToken);
  });

  it('should fail without caching when the granted scope is missing', async () => {
    const { getWorkerAccessToken } = createCloudConnectionLibrary(logtoConfigs);

    // The OIDC provider filters an ungranted scope out and still answers 200.
    nock(adminEndpoint).post('/oidc/token').reply(200, {
      access_token: 'scopelessToken',
      expires_in: 3600,
      token_type: 'Bearer',
    });

    await expect(getWorkerAccessToken()).rejects.toThrow(
      'The minted worker access token is missing'
    );

    // Not cached: the next call mints again and succeeds once the grant is in place.
    nock(adminEndpoint).post('/oidc/token').reply(200, {
      access_token: mockWorkerAccessToken,
      expires_in: 3600,
      token_type: 'Bearer',
      scope: 'invoke:worker:script-run',
    });

    await expect(getWorkerAccessToken()).resolves.toBe(mockWorkerAccessToken);
  });
});
