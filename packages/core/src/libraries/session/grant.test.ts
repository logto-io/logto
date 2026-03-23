import type { Provider } from 'oidc-provider';

import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';

import { createSessionLibrary } from './index.js';

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

describe('grant revocation', () => {
  const revokeAccessTokenByGrantId = jest.fn<Promise<string>, [string]>(async () => 'ok');
  const revokeRefreshTokenByGrantId = jest.fn<Promise<string>, [string]>(async () => 'ok');
  const revokeAuthorizationCodeByGrantId = jest.fn<Promise<string>, [string]>(async () => 'ok');
  const revokeDeviceCodeByGrantId = jest.fn<Promise<string>, [string]>(async () => 'ok');
  const revokeBackchannelAuthenticationRequestByGrantId = jest.fn<Promise<string>, [string]>(
    async () => 'ok'
  );
  const destroyGrant = jest.fn(async () => 'ok');
  const findGrant = jest.fn<
    Promise<{ accountId?: string; exp?: number } | undefined>,
    [string, { ignoreExpiration: boolean }]
  >();
  const provider = {
    AccessToken: { revokeByGrantId: revokeAccessTokenByGrantId },
    RefreshToken: { revokeByGrantId: revokeRefreshTokenByGrantId },
    AuthorizationCode: { revokeByGrantId: revokeAuthorizationCodeByGrantId },
    DeviceCode: { revokeByGrantId: revokeDeviceCodeByGrantId },
    BackchannelAuthenticationRequest: {
      revokeByGrantId: revokeBackchannelAuthenticationRequestByGrantId,
    },
    Grant: { find: findGrant, adapter: { destroy: destroyGrant } },
  } as unknown as Provider;

  const sessionLibrary = createSessionLibrary({
    oidcModelInstances: {},
    oidcSessionExtensions: {
      findUserActiveSessionsWithExtensions: jest.fn(async () => []),
      findUserActiveSessionWithExtension: jest.fn(async () => null),
    },
  } as unknown as Queries);

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('revokeUserGrantById', () => {
    it('should revoke active grant if it belongs to user', async () => {
      findGrant.mockResolvedValueOnce({
        accountId: 'user-id',
        exp: Math.ceil(Date.now() / 1000) + 3600,
      });

      await sessionLibrary.revokeUserGrantById(provider, 'user-id', 'grant-id');

      expect(findGrant).toHaveBeenCalledWith('grant-id', { ignoreExpiration: true });
      expect(revokeAccessTokenByGrantId).toHaveBeenCalledWith('grant-id');
      expect(revokeRefreshTokenByGrantId).toHaveBeenCalledWith('grant-id');
      expect(revokeAuthorizationCodeByGrantId).toHaveBeenCalledWith('grant-id');
      expect(revokeDeviceCodeByGrantId).toHaveBeenCalledWith('grant-id');
      expect(revokeBackchannelAuthenticationRequestByGrantId).toHaveBeenCalledWith('grant-id');
      expect(destroyGrant).toHaveBeenCalledWith('grant-id');
    });

    it('should skip token-chain revoke if grant is already expired', async () => {
      findGrant.mockResolvedValueOnce({
        accountId: 'user-id',
        exp: Math.floor(Date.now() / 1000) - 1,
      });

      await sessionLibrary.revokeUserGrantById(provider, 'user-id', 'grant-id');

      expect(revokeAccessTokenByGrantId).not.toHaveBeenCalled();
      expect(revokeRefreshTokenByGrantId).not.toHaveBeenCalled();
      expect(revokeAuthorizationCodeByGrantId).not.toHaveBeenCalled();
      expect(revokeDeviceCodeByGrantId).not.toHaveBeenCalled();
      expect(revokeBackchannelAuthenticationRequestByGrantId).not.toHaveBeenCalled();
      expect(destroyGrant).not.toHaveBeenCalled();
    });

    it('should throw 404 if grant is missing', async () => {
      // eslint-disable-next-line unicorn/no-useless-undefined
      findGrant.mockResolvedValueOnce(undefined);

      await expect(
        sessionLibrary.revokeUserGrantById(provider, 'user-id', 'missing-grant-id')
      ).rejects.toMatchObject({ status: 404, code: 'oidc.invalid_grant' });
    });

    it('should throw 404 if grant belongs to another user', async () => {
      findGrant.mockResolvedValueOnce({
        accountId: 'another-user-id',
        exp: Math.ceil(Date.now() / 1000) + 3600,
      });

      await expect(
        sessionLibrary.revokeUserGrantById(provider, 'user-id', 'grant-id')
      ).rejects.toMatchObject({ status: 404, code: 'oidc.invalid_grant' });
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
  });

  describe('revokeUserGrantsByIds', () => {
    it('should revoke all unique grant ids successfully', async () => {
      await expect(
        sessionLibrary.revokeUserGrantsByIds(provider, ['grant-id-1', 'grant-id-1', 'grant-id-2'])
      ).resolves.toEqual({
        succeededNames: ['grant-id-1', 'grant-id-2'],
        failedTasks: [],
      });

      expect(revokeAccessTokenByGrantId).toHaveBeenCalledTimes(2);
      expect(revokeAccessTokenByGrantId).toHaveBeenCalledWith('grant-id-1');
      expect(revokeAccessTokenByGrantId).toHaveBeenCalledWith('grant-id-2');
      expect(revokeRefreshTokenByGrantId).toHaveBeenCalledTimes(2);
      expect(revokeAuthorizationCodeByGrantId).toHaveBeenCalledTimes(2);
      expect(revokeDeviceCodeByGrantId).toHaveBeenCalledTimes(2);
      expect(revokeBackchannelAuthenticationRequestByGrantId).toHaveBeenCalledTimes(2);
      expect(destroyGrant).toHaveBeenCalledTimes(2);
      expect(findGrant).not.toHaveBeenCalled();
    });

    it('should return failed task summary when batch revoke chain fails', async () => {
      revokeRefreshTokenByGrantId.mockRejectedValueOnce(new Error('refresh revoke failed'));

      const result = await sessionLibrary.revokeUserGrantsByIds(provider, ['grant-id']);

      expect(result.succeededNames).toEqual([]);
      expect(result.failedTasks).toHaveLength(1);
      expect(result.failedTasks[0]?.name).toBe('grant-id');
      expect(isSerializedRequestErrorCause(result.failedTasks[0]?.cause)).toBe(true);
      expect(
        isSerializedRequestErrorCause(result.failedTasks[0]?.cause) &&
          result.failedTasks[0].cause.code === 'oidc.failed_to_revoke_grant'
      ).toBe(true);
      expect(
        isSerializedRequestErrorCause(result.failedTasks[0]?.cause) &&
          JSON.stringify(result.failedTasks[0].cause.data).includes('refresh revoke failed')
      ).toBe(true);
    });

    it('should report succeeded and failed grant ids when batch revoke partially fails', async () => {
      revokeRefreshTokenByGrantId.mockImplementation(async (grantId: string) => {
        if (grantId === 'grant-id-2') {
          throw new Error('refresh revoke failed for grant-id-2');
        }

        return 'ok';
      });

      const result = await sessionLibrary.revokeUserGrantsByIds(provider, [
        'grant-id-1',
        'grant-id-2',
      ]);

      expect(result.succeededNames).toContain('grant-id-1');
      expect(result.failedTasks).toHaveLength(1);
      expect(result.failedTasks[0]?.name).toBe('grant-id-2');
      expect(isSerializedRequestErrorCause(result.failedTasks[0]?.cause)).toBe(true);
    });

    it('should return failed task summary for duplicated failing grant id', async () => {
      revokeRefreshTokenByGrantId.mockRejectedValueOnce(new Error('refresh revoke failed'));

      const result = await sessionLibrary.revokeUserGrantsByIds(provider, ['grant-id', 'grant-id']);

      expect(result.succeededNames).toEqual([]);
      expect(result.failedTasks).toHaveLength(1);
      expect(result.failedTasks[0]?.name).toBe('grant-id');
    });
  });
});
