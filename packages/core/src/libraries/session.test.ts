import { SessionGrantRevokeTarget, type User } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import type { Provider } from 'oidc-provider';

import { mockUser } from '#src/__mocks__/user.js';
import type Queries from '#src/tenants/Queries.js';
import { GrantMock, createMockProvider } from '#src/test-utils/oidc-provider.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import { consent, createSessionLibrary } from './session.js';

const { jest } = import.meta;

const grantSave = jest.fn(async (id: string) => id);
const grantAddOIDCScope = jest.fn();
const grantAddResourceScope = jest.fn();

class Grant extends GrantMock {
  static async find(id: string) {
    return id === 'exists' ? existGrant : undefined;
  }

  id: string;

  accountId?: string;

  constructor() {
    super();
    this.id = generateStandardId();
    this.save = async () => grantSave(this.id);
    this.addOIDCScope = grantAddOIDCScope;
    this.addResourceScope = grantAddResourceScope;
  }
}

const existGrant = new Grant();

const userQueries = {
  findUserById: jest.fn(async (): Promise<User> => mockUser),
  updateUserById: jest.fn(async (..._args: unknown[]) => ({ id: 'id' })),
};

// @ts-expect-error
const queries: Queries = { users: userQueries };
const context = createContextWithRouteParameters();

type Interaction = Awaited<ReturnType<Provider['interactionDetails']>>;

describe('consent', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const baseInteractionDetails = {
    session: { accountId: mockUser.id },
    params: { client_id: 'clientId' },
    prompt: { details: {} },
  } as unknown as Interaction;

  it('should update with new grantId if not exist', async () => {
    const provider = createMockProvider(jest.fn().mockResolvedValue(baseInteractionDetails), Grant);
    await consent({ ctx: context, provider, queries, interactionDetails: baseInteractionDetails });

    expect(grantSave).toHaveBeenCalled();

    expect(provider.interactionResult).toHaveBeenCalledWith(
      context.req,
      context.res,
      {
        ...baseInteractionDetails.result,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        consent: { grantId: expect.any(String) },
      },
      {
        mergeWithLastSubmission: true,
      }
    );
  });

  it('should update with existing grantId if exist', async () => {
    const interactionDetails = {
      ...baseInteractionDetails,
      grantId: 'exists',
    } as unknown as Interaction;

    const provider = createMockProvider(jest.fn().mockResolvedValue(interactionDetails), Grant);

    await consent({ ctx: context, provider, queries, interactionDetails });

    expect(grantSave).toHaveBeenCalled();

    expect(provider.interactionResult).toHaveBeenCalledWith(
      context.req,
      context.res,
      {
        ...baseInteractionDetails.result,
        consent: { grantId: existGrant.id },
      },
      {
        mergeWithLastSubmission: true,
      }
    );
  });

  it('should save first consented app id', async () => {
    userQueries.findUserById.mockImplementationOnce(async () => ({
      ...mockUser,
      applicationId: null,
    }));

    const provider = createMockProvider(jest.fn().mockResolvedValue(baseInteractionDetails), Grant);
    await consent({ ctx: context, provider, queries, interactionDetails: baseInteractionDetails });

    expect(userQueries.updateUserById).toHaveBeenCalledWith(mockUser.id, {
      applicationId: baseInteractionDetails.params.client_id,
    });
  });

  it('should grant missing scopes', async () => {
    const provider = createMockProvider(jest.fn().mockResolvedValue(baseInteractionDetails), Grant);
    await consent({
      ctx: context,
      provider,
      queries,
      interactionDetails: baseInteractionDetails,
      missingOIDCScopes: ['openid', 'profile'],
      resourceScopesToGrant: {
        resource1: ['resource1_scope1', 'resource1_scope2'],
        resource2: ['resource2_scope1'],
      },
    });

    expect(grantAddOIDCScope).toHaveBeenCalledWith('openid profile');
    expect(grantAddResourceScope).toHaveBeenCalledWith(
      'resource1',
      'resource1_scope1 resource1_scope2'
    );
    expect(grantAddResourceScope).toHaveBeenCalledWith('resource2', 'resource2_scope1');
  });
});

describe('revokeSessionAssociatedGrants', () => {
  const revokeAccessTokenByGrantId = jest.fn(async () => 'ok');
  const revokeRefreshTokenByGrantId = jest.fn(async () => 'ok');
  const revokeAuthorizationCodeByGrantId = jest.fn(async () => 'ok');
  const destroyGrant = jest.fn(async () => 'ok');

  const provider = {
    AccessToken: { revokeByGrantId: revokeAccessTokenByGrantId },
    RefreshToken: { revokeByGrantId: revokeRefreshTokenByGrantId },
    AuthorizationCode: { revokeByGrantId: revokeAuthorizationCodeByGrantId },
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
    expect(destroyGrant).not.toHaveBeenCalled();
  });
});

describe('revokeUserGrantById', () => {
  const revokeAccessTokenByGrantId = jest.fn(async () => 'ok');
  const revokeRefreshTokenByGrantId = jest.fn(async () => 'ok');
  const revokeAuthorizationCodeByGrantId = jest.fn(async () => 'ok');
  const destroyGrant = jest.fn(async () => 'ok');
  const findGrant = jest.fn<
    Promise<{ accountId?: string; exp?: number } | undefined>,
    [string, { ignoreExpiration: boolean }]
  >();
  const provider = {
    AccessToken: { revokeByGrantId: revokeAccessTokenByGrantId },
    RefreshToken: { revokeByGrantId: revokeRefreshTokenByGrantId },
    AuthorizationCode: { revokeByGrantId: revokeAuthorizationCodeByGrantId },
    Grant: { find: findGrant, adapter: { destroy: destroyGrant } },
  } as unknown as Provider;

  const sessionLibrary = createSessionLibrary({
    oidcSessionExtensions: {
      findUserActiveSessionsWithExtensions: jest.fn(async () => []),
      findUserActiveSessionWithExtension: jest.fn(async () => null),
      findUserActiveSessionUidByGrantId: jest.fn(async () => null),
    },
  } as unknown as Queries);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should revoke active grant if it belongs to user', async () => {
    findGrant.mockResolvedValueOnce({
      accountId: 'user-id',
      exp: Math.ceil(Date.now() / 1000) + 3600,
    });

    await sessionLibrary.revokeUserGrantById({
      provider,
      userId: 'user-id',
      grantId: 'grant-id',
    });

    expect(findGrant).toHaveBeenCalledWith('grant-id', { ignoreExpiration: true });
    expect(revokeAccessTokenByGrantId).toHaveBeenCalledWith('grant-id');
    expect(revokeRefreshTokenByGrantId).toHaveBeenCalledWith('grant-id');
    expect(revokeAuthorizationCodeByGrantId).toHaveBeenCalledWith('grant-id');
    expect(destroyGrant).toHaveBeenCalledWith('grant-id');
  });

  it('should skip token-chain revoke if grant is already expired', async () => {
    findGrant.mockResolvedValueOnce({
      accountId: 'user-id',
      exp: Math.floor(Date.now() / 1000) - 1,
    });

    await sessionLibrary.revokeUserGrantById({
      provider,
      userId: 'user-id',
      grantId: 'grant-id',
    });

    expect(revokeAccessTokenByGrantId).not.toHaveBeenCalled();
    expect(revokeRefreshTokenByGrantId).not.toHaveBeenCalled();
    expect(revokeAuthorizationCodeByGrantId).not.toHaveBeenCalled();
    expect(destroyGrant).not.toHaveBeenCalled();
  });

  it('should throw 404 if grant is missing', async () => {
    // eslint-disable-next-line unicorn/no-useless-undefined
    findGrant.mockResolvedValueOnce(undefined);

    await expect(
      sessionLibrary.revokeUserGrantById({
        provider,
        userId: 'user-id',
        grantId: 'missing-grant-id',
      })
    ).rejects.toMatchObject({ status: 404, code: 'oidc.invalid_grant' });
  });

  it('should throw 404 if grant belongs to another user', async () => {
    findGrant.mockResolvedValueOnce({
      accountId: 'another-user-id',
      exp: Math.ceil(Date.now() / 1000) + 3600,
    });

    await expect(
      sessionLibrary.revokeUserGrantById({
        provider,
        userId: 'user-id',
        grantId: 'grant-id',
      })
    ).rejects.toMatchObject({ status: 404, code: 'oidc.invalid_grant' });
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
    oidcSessionExtensions: {
      findUserActiveSessionsWithExtensions: jest.fn(async () => []),
      findUserActiveSessionWithExtension: jest.fn(async () => null),
      findUserActiveSessionUidByGrantId,
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

    await sessionLibrary.removeUserSessionAuthorizationByGrantId({
      provider,
      userId: 'user-id',
      grantId: 'grant-id',
    });

    expect(findUserActiveSessionUidByGrantId).toHaveBeenCalledWith('user-id', 'grant-id');
    expect(findByUid).toHaveBeenCalledWith('session-id');
    expect(resetIdentifier).toHaveBeenCalled();
    expect(persist).toHaveBeenCalled();
  });

  it('should skip if no active session reference found', async () => {
    // eslint-disable-next-line unicorn/no-useless-undefined
    findUserActiveSessionUidByGrantId.mockResolvedValueOnce(undefined);

    await sessionLibrary.removeUserSessionAuthorizationByGrantId({
      provider,
      userId: 'user-id',
      grantId: 'grant-id',
    });

    expect(findByUid).not.toHaveBeenCalled();
    expect(resetIdentifier).not.toHaveBeenCalled();
    expect(persist).not.toHaveBeenCalled();
  });
});
