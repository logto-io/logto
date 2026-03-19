import { appInsights } from '@logto/app-insights/node';

import { MockQueries } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import { createAuthorizationSuccessListener } from './authorization-success.js';

const { jest } = import.meta;

const createMockAuthorizationSuccessContext = ({
  userId = 'user-id',
  clientId = 'client-id',
  maxAllowedGrants,
}: {
  userId?: string;
  clientId?: string;
  maxAllowedGrants?: number;
}) => ({
  ...createContextWithRouteParameters(),
  oidc: {
    session: { accountId: userId },
    client: { clientId, metadata: () => ({ maxAllowedGrants }) },
  },
});

const createMockProvider = () => {
  const revokeByGrantId = jest.fn(async (grantId: string) => grantId);
  const destroy = jest.fn(async (grantId: string) => grantId);

  return {
    provider: {
      AccessToken: { revokeByGrantId },
      RefreshToken: { revokeByGrantId },
      AuthorizationCode: { revokeByGrantId },
      DeviceCode: { revokeByGrantId },
      BackchannelAuthenticationRequest: { revokeByGrantId },
      Grant: { adapter: { destroy } },
      Session: { findByUid: jest.fn(async () => null) },
    },
    revokeByGrantId,
    destroy,
  };
};

describe('createAuthorizationSuccessListener', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should ignore when maxAllowedGrants is not configured', async () => {
    const { provider, revokeByGrantId, destroy } = createMockProvider();
    const findUserActiveGrantsByClientId = jest.fn(async () => []);

    const listener = createAuthorizationSuccessListener(
      // @ts-expect-error Provider mock is enough for unit test
      provider,
      new MockQueries({
        oidcModelInstances: {
          findUserActiveGrantsByClientId,
          findUserActiveSessionUidByGrantId: jest.fn(async () => null),
        },
      })
    );

    const context = createMockAuthorizationSuccessContext({});
    // @ts-expect-error Context mock is enough for unit test
    await listener(context);

    expect(findUserActiveGrantsByClientId).not.toHaveBeenCalled();
    expect(revokeByGrantId).not.toHaveBeenCalled();
    expect(destroy).not.toHaveBeenCalled();
  });

  it('should revoke oldest grants when active grants exceed maxAllowedGrants', async () => {
    const { provider, revokeByGrantId, destroy } = createMockProvider();
    const findUserActiveGrantsByClientId = jest.fn(async () => [
      {
        id: 'grant-3',
        payload: {
          exp: 999_999_999,
          iat: 30,
          jti: 'grant-jti-3',
          kind: 'Grant',
          clientId: 'client-id',
          accountId: 'user-id',
        },
        expiresAt: Date.now() + 1000,
      },
      {
        id: 'grant-1',
        payload: {
          exp: 999_999_999,
          iat: 10,
          jti: 'grant-jti-1',
          kind: 'Grant',
          clientId: 'client-id',
          accountId: 'user-id',
        },
        expiresAt: Date.now() + 1000,
      },
      {
        id: 'grant-2',
        payload: {
          exp: 999_999_999,
          iat: 20,
          jti: 'grant-jti-2',
          kind: 'Grant',
          clientId: 'client-id',
          accountId: 'user-id',
        },
        expiresAt: Date.now() + 1000,
      },
    ]);

    const listener = createAuthorizationSuccessListener(
      // @ts-expect-error Provider mock is enough for unit test
      provider,
      new MockQueries({
        oidcModelInstances: {
          findUserActiveGrantsByClientId,
          findUserActiveSessionUidByGrantId: jest.fn(async () => null),
        },
      })
    );

    const context = createMockAuthorizationSuccessContext({ maxAllowedGrants: 1 });
    // @ts-expect-error Context mock is enough for unit test
    await listener(context);

    expect(revokeByGrantId).toHaveBeenCalledTimes(10);
    expect(revokeByGrantId).toHaveBeenCalledWith('grant-1');
    expect(revokeByGrantId).toHaveBeenCalledWith('grant-2');
    expect(revokeByGrantId).not.toHaveBeenCalledWith('grant-3');
    expect(destroy).toHaveBeenCalledTimes(2);
    expect(destroy).toHaveBeenCalledWith('grant-1');
    expect(destroy).toHaveBeenCalledWith('grant-2');
  });

  it('should track exception when grant query fails', async () => {
    const { provider, revokeByGrantId, destroy } = createMockProvider();
    const error = new Error('query failed');
    const findUserActiveGrantsByClientId = jest.fn(async () => {
      throw error;
    });
    const trackException = jest
      .spyOn(appInsights, 'trackException')
      .mockImplementation(async () => {
        await Promise.resolve();
      });

    const listener = createAuthorizationSuccessListener(
      // @ts-expect-error Provider mock is enough for unit test
      provider,
      new MockQueries({
        oidcModelInstances: {
          findUserActiveGrantsByClientId,
          findUserActiveSessionUidByGrantId: jest.fn(async () => null),
        },
      })
    );

    const context = createMockAuthorizationSuccessContext({ maxAllowedGrants: 1 });
    // @ts-expect-error Context mock is enough for unit test
    await listener(context);

    expect(revokeByGrantId).not.toHaveBeenCalled();
    expect(destroy).not.toHaveBeenCalled();
    expect(trackException).toHaveBeenCalled();
  });
});
