import { SessionGrantRevokeTarget } from '@logto/schemas';
import type { Provider } from 'oidc-provider';

import type Queries from '#src/tenants/Queries.js';

import { createSessionLibrary } from './index.js';

const { jest } = import.meta;

describe('revokeSessionAssociatedGrants', () => {
  const revokeAccessTokenByGrantId = jest.fn(async () => 'ok');
  const revokeRefreshTokenByGrantId = jest.fn(async () => 'ok');
  const revokeAuthorizationCodeByGrantId = jest.fn(async () => 'ok');
  const revokeDeviceCodeByGrantId = jest.fn(async () => 'ok');
  const revokeBackchannelAuthenticationRequestByGrantId = jest.fn(async () => 'ok');
  const destroyGrant = jest.fn(async () => 'ok');

  const provider = {
    AccessToken: { revokeByGrantId: revokeAccessTokenByGrantId },
    RefreshToken: { revokeByGrantId: revokeRefreshTokenByGrantId },
    AuthorizationCode: { revokeByGrantId: revokeAuthorizationCodeByGrantId },
    DeviceCode: { revokeByGrantId: revokeDeviceCodeByGrantId },
    BackchannelAuthenticationRequest: {
      revokeByGrantId: revokeBackchannelAuthenticationRequestByGrantId,
    },
    Grant: { adapter: { destroy: destroyGrant } },
  } as unknown as Provider;

  const findApplicationsByIds = jest.fn<
    Promise<Array<{ id: string; isThirdParty: boolean }>>,
    [string[]]
  >(async () => []);

  const sessionLibrary = createSessionLibrary({
    applications: { findApplicationsByIds },
    oidcSessionExtensions: {
      findUserActiveSessionsWithExtensions: jest.fn(async () => []),
      findUserActiveSessionWithExtension: jest.fn(async () => null),
    },
  } as unknown as Queries);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should revoke all grants when revokeAllGrants is true', async () => {
    await sessionLibrary.revokeSessionAssociatedGrants({
      provider,
      authorizations: {
        app1: { grantId: 'grant-1' },
        app2: { grantId: 'grant-2' },
        app3: {},
      },
      target: SessionGrantRevokeTarget.All,
    });

    expect(findApplicationsByIds).not.toHaveBeenCalled();
    expect(revokeAccessTokenByGrantId).toHaveBeenCalledTimes(2);
    expect(revokeAccessTokenByGrantId).toHaveBeenCalledWith('grant-1');
    expect(revokeAccessTokenByGrantId).toHaveBeenCalledWith('grant-2');
    expect(revokeRefreshTokenByGrantId).toHaveBeenCalledTimes(2);
    expect(revokeAuthorizationCodeByGrantId).toHaveBeenCalledTimes(2);
    expect(revokeDeviceCodeByGrantId).toHaveBeenCalledTimes(2);
    expect(revokeBackchannelAuthenticationRequestByGrantId).toHaveBeenCalledTimes(2);
    expect(destroyGrant).toHaveBeenCalledTimes(2);
  });

  it('should revoke first-party grants only when revokeFirstPartyAppGrants is true', async () => {
    findApplicationsByIds.mockResolvedValueOnce([
      { id: 'first-party-app', isThirdParty: false },
      { id: 'third-party-app', isThirdParty: true },
    ]);

    await sessionLibrary.revokeSessionAssociatedGrants({
      provider,
      authorizations: {
        'first-party-app': { grantId: 'grant-1' },
        'third-party-app': { grantId: 'grant-2' },
        'unknown-app': { grantId: 'grant-3' },
      },
      target: SessionGrantRevokeTarget.FirstParty,
    });

    expect(findApplicationsByIds).toHaveBeenCalledWith([
      'first-party-app',
      'third-party-app',
      'unknown-app',
    ]);
    expect(revokeAccessTokenByGrantId).toHaveBeenCalledTimes(1);
    expect(revokeAccessTokenByGrantId).toHaveBeenCalledWith('grant-1');
    expect(revokeRefreshTokenByGrantId).toHaveBeenCalledTimes(1);
    expect(revokeAuthorizationCodeByGrantId).toHaveBeenCalledTimes(1);
    expect(revokeDeviceCodeByGrantId).toHaveBeenCalledTimes(1);
    expect(revokeBackchannelAuthenticationRequestByGrantId).toHaveBeenCalledTimes(1);
    expect(destroyGrant).toHaveBeenCalledTimes(1);
  });

  it('should not revoke grants when no authorizations are found', async () => {
    await sessionLibrary.revokeSessionAssociatedGrants({
      provider,
      authorizations: {},
      target: SessionGrantRevokeTarget.FirstParty,
    });

    expect(findApplicationsByIds).not.toHaveBeenCalled();
    expect(revokeAccessTokenByGrantId).not.toHaveBeenCalled();
    expect(revokeRefreshTokenByGrantId).not.toHaveBeenCalled();
    expect(revokeAuthorizationCodeByGrantId).not.toHaveBeenCalled();
    expect(revokeDeviceCodeByGrantId).not.toHaveBeenCalled();
    expect(revokeBackchannelAuthenticationRequestByGrantId).not.toHaveBeenCalled();
    expect(destroyGrant).not.toHaveBeenCalled();
  });
});

describe('removeUserSessionAuthorizationByGrantId', () => {
  const findByUid = jest.fn<
    Promise<
      | {
          accountId?: string;
          authorizations?: Record<string, { grantId?: string }>;
          resetIdentifier: () => void;
          persist: () => Promise<void>;
        }
      | undefined
    >,
    [string]
  >();
  const resetIdentifier = jest.fn();
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const persist = jest.fn(async () => {});
  const findUserActiveSessionUidByGrantId = jest.fn<
    Promise<{ sessionUid: string } | undefined>,
    [string, string]
  >();

  const provider = {
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

  it('should remove matching authorization and persist session', async () => {
    findUserActiveSessionUidByGrantId.mockResolvedValueOnce({ sessionUid: 'session-id' });
    findByUid.mockResolvedValueOnce({
      accountId: 'user-id',
      authorizations: { app1: { grantId: 'grant-id' }, app2: { grantId: 'grant-2' } },
      resetIdentifier,
      persist,
    });

    await sessionLibrary.removeUserSessionAuthorizationByGrantId(provider, 'user-id', 'grant-id');

    expect(findUserActiveSessionUidByGrantId).toHaveBeenCalledWith('user-id', 'grant-id');
    expect(findByUid).toHaveBeenCalledWith('session-id');
    expect(resetIdentifier).toHaveBeenCalled();
    expect(persist).toHaveBeenCalled();
  });

  it('should skip if no active session reference found', async () => {
    // eslint-disable-next-line unicorn/no-useless-undefined
    findUserActiveSessionUidByGrantId.mockResolvedValueOnce(undefined);

    await sessionLibrary.removeUserSessionAuthorizationByGrantId(provider, 'user-id', 'grant-id');

    expect(findByUid).not.toHaveBeenCalled();
    expect(resetIdentifier).not.toHaveBeenCalled();
    expect(persist).not.toHaveBeenCalled();
  });
});

describe('removeUserSessionAuthorizationsByGrantIds', () => {
  const findByUid = jest.fn<
    Promise<
      | {
          accountId?: string;
          authorizations?: Record<string, { grantId?: string }>;
          resetIdentifier: () => void;
          persist: () => Promise<void>;
        }
      | undefined
    >,
    [string]
  >();
  const findUserActiveSessionUidByGrantId = jest.fn<
    Promise<{ sessionUid: string } | undefined>,
    [string, string]
  >();

  const provider = {
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

  it('should cleanup multiple grantIds in one session with one persist', async () => {
    const resetIdentifier = jest.fn();
    const persist = jest.fn(async () => {
      await Promise.resolve();
    });

    findUserActiveSessionUidByGrantId
      .mockResolvedValueOnce({ sessionUid: 'session-1' })
      .mockResolvedValueOnce({ sessionUid: 'session-1' });
    findByUid.mockResolvedValueOnce({
      accountId: 'user-id',
      authorizations: {
        app1: { grantId: 'grant-1' },
        app2: { grantId: 'grant-2' },
        app3: { grantId: 'grant-3' },
      },
      resetIdentifier,
      persist,
    });

    const result = await sessionLibrary.removeUserSessionAuthorizationsByGrantIds(
      provider,
      'user-id',
      ['grant-1', 'grant-2']
    );

    expect(findUserActiveSessionUidByGrantId).toHaveBeenNthCalledWith(1, 'user-id', 'grant-1');
    expect(findUserActiveSessionUidByGrantId).toHaveBeenNthCalledWith(2, 'user-id', 'grant-2');
    expect(findByUid).toHaveBeenCalledTimes(1);
    expect(findByUid).toHaveBeenCalledWith('session-1');
    expect(resetIdentifier).toHaveBeenCalledTimes(1);
    expect(persist).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      succeededGrantIds: ['grant-1', 'grant-2'],
      failedGrants: [],
    });
  });

  it('should return failed grantIds when session cleanup fails', async () => {
    const resetIdentifier1 = jest.fn();
    const persist1 = jest.fn(async () => {
      await Promise.resolve();
    });
    const resetIdentifier2 = jest.fn();
    const persist2 = jest.fn(async () => {
      throw new Error('persist failed');
    });

    findUserActiveSessionUidByGrantId
      .mockResolvedValueOnce({ sessionUid: 'session-1' })
      .mockResolvedValueOnce({ sessionUid: 'session-2' });
    findByUid
      .mockResolvedValueOnce({
        accountId: 'user-id',
        authorizations: { app1: { grantId: 'grant-1' } },
        resetIdentifier: resetIdentifier1,
        persist: persist1,
      })
      .mockResolvedValueOnce({
        accountId: 'user-id',
        authorizations: { app2: { grantId: 'grant-2' } },
        resetIdentifier: resetIdentifier2,
        persist: persist2,
      });

    const result = await sessionLibrary.removeUserSessionAuthorizationsByGrantIds(
      provider,
      'user-id',
      ['grant-1', 'grant-2']
    );

    expect(result.succeededGrantIds).toEqual(['grant-1']);
    expect(result.failedGrants).toHaveLength(1);
    expect(result.failedGrants[0]?.grantId).toBe('grant-2');
    expect(result.failedGrants[0]?.cause).toContain('persist failed');
  });
});
