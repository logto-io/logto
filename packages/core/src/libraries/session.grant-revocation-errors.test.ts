import type { Nullable } from '@silverhand/essentials';
import type { Provider } from 'oidc-provider';

import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';

import { createSessionLibrary } from './session.js';

const { jest } = import.meta;

const captureError = async (promise: Promise<unknown>) => {
  try {
    await promise;
  } catch (error: unknown) {
    return error;
  }
};

type SerializedRequestErrorCause = {
  code: string;
  details?: string;
  data: unknown;
};

const isSerializedRequestErrorCause = (cause: unknown): cause is SerializedRequestErrorCause =>
  typeof cause === 'object' && cause !== null && 'code' in cause && 'data' in cause;

describe('grant revocation error handling', () => {
  const revokeAccessTokenByGrantId = jest.fn(async () => 'ok');
  const revokeRefreshTokenByGrantId = jest.fn(async () => 'ok');
  const revokeAuthorizationCodeByGrantId = jest.fn(async () => 'ok');
  const revokeDeviceCodeByGrantId = jest.fn(async () => 'ok');
  const revokeBackchannelAuthenticationRequestByGrantId = jest.fn(async () => 'ok');
  const destroyGrant = jest.fn(async () => 'ok');
  const findGrant = jest.fn<
    Promise<{ accountId?: string; exp?: number } | undefined>,
    [string, { ignoreExpiration: boolean }]
  >();
  const findByUid = jest.fn(async () => null);
  const findUserActiveSessionUidByGrantId = jest.fn<
    Promise<Nullable<{ sessionUid: string }>>,
    [string, string]
  >(async () => null);

  const provider = {
    AccessToken: { revokeByGrantId: revokeAccessTokenByGrantId },
    RefreshToken: { revokeByGrantId: revokeRefreshTokenByGrantId },
    AuthorizationCode: { revokeByGrantId: revokeAuthorizationCodeByGrantId },
    DeviceCode: { revokeByGrantId: revokeDeviceCodeByGrantId },
    BackchannelAuthenticationRequest: {
      revokeByGrantId: revokeBackchannelAuthenticationRequestByGrantId,
    },
    Grant: { find: findGrant, adapter: { destroy: destroyGrant } },
    Session: { findByUid },
  } as unknown as Provider;

  const sessionLibrary = createSessionLibrary({
    oidcModelInstances: {
      findUserActiveSessionUidByGrantId,
    },
    oidcSessionExtensions: {
      findUserActiveSessionsWithExtensions: jest.fn(async () => []),
      findUserActiveSessionWithExtension: jest.fn(async () => null),
    },
  } as unknown as Queries);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw failed_to_revoke_grant with details when single revoke chain fails', async () => {
    findGrant.mockResolvedValueOnce({
      accountId: 'user-id',
      exp: Math.ceil(Date.now() / 1000) + 3600,
    });
    revokeRefreshTokenByGrantId.mockRejectedValueOnce(new Error('refresh revoke failed'));

    const caughtError = await captureError(
      sessionLibrary.revokeUserGrantById(provider, 'user-id', 'grant-id')
    );

    expect(caughtError).toBeInstanceOf(RequestError);

    if (caughtError instanceof RequestError) {
      const errorData = caughtError.data as {
        details?: { failedModels?: Array<{ name: string; cause: string }> };
      };
      const failedModels = errorData.details?.failedModels ?? [];

      expect(caughtError.code).toBe('oidc.failed_to_revoke_grant');
      expect(failedModels.some((failedModel) => failedModel.name === 'RefreshToken')).toBe(true);
      expect(
        failedModels.some((failedModel) => failedModel.cause.includes('refresh revoke failed'))
      ).toBe(true);
    }
  });

  it('should throw failed_to_revoke_grant with details when batch revoke chain fails', async () => {
    revokeRefreshTokenByGrantId.mockRejectedValueOnce(new Error('refresh revoke failed'));

    const caughtError = await captureError(
      sessionLibrary.revokeUserGrantsByIds(provider, 'user-id', ['grant-id'])
    );

    expect(caughtError).toBeInstanceOf(RequestError);

    if (caughtError instanceof RequestError) {
      const errorData = caughtError.data as {
        details?: {
          succeededGrantIds?: string[];
          failedGrants?: Array<{ grantId: string; cause: string | SerializedRequestErrorCause }>;
        };
      };
      const failedGrants = errorData.details?.failedGrants ?? [];
      const targetGrant = failedGrants.find((failedGrant) => failedGrant.grantId === 'grant-id');

      expect(caughtError.code).toBe('oidc.failed_to_revoke_grant');
      expect(errorData.details?.succeededGrantIds).toEqual([]);
      expect(failedGrants.some((failedGrant) => failedGrant.grantId === 'grant-id')).toBe(true);
      expect(isSerializedRequestErrorCause(targetGrant?.cause)).toBe(true);
      expect(
        isSerializedRequestErrorCause(targetGrant?.cause) &&
          targetGrant.cause.code === 'oidc.failed_to_revoke_grant'
      ).toBe(true);
      expect(
        isSerializedRequestErrorCause(targetGrant?.cause) &&
          JSON.stringify(targetGrant.cause.data).includes('refresh revoke failed')
      ).toBe(true);
    }
  });

  it('should include failed grant id when batch cleanup fails', async () => {
    findUserActiveSessionUidByGrantId.mockResolvedValueOnce({ sessionUid: 'session-id' });
    findByUid.mockRejectedValueOnce(new Error('session lookup failed'));

    const caughtError = await captureError(
      sessionLibrary.revokeUserGrantsByIds(provider, 'user-id', ['grant-id'])
    );

    expect(caughtError).toBeInstanceOf(RequestError);

    if (caughtError instanceof RequestError) {
      const errorData = caughtError.data as {
        details?: {
          failedGrants?: Array<{ grantId: string; cause: string | SerializedRequestErrorCause }>;
        };
      };
      const failedGrants = errorData.details?.failedGrants ?? [];
      const targetGrant = failedGrants.find((failedGrant) => failedGrant.grantId === 'grant-id');

      expect(caughtError.code).toBe('oidc.failed_to_revoke_grant');
      expect(targetGrant).toBeDefined();
      expect(isSerializedRequestErrorCause(targetGrant?.cause)).toBe(true);
      expect(
        isSerializedRequestErrorCause(targetGrant?.cause) &&
          targetGrant.cause.code === 'oidc.failed_to_cleanup_session_authorization'
      ).toBe(true);
    }
  });
});
