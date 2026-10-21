/* eslint-disable max-lines -- the CIMD grant scenarios push the suite over the limit */
import { UserScope } from '@logto/core-kit';
import { type KoaContextWithOIDC, errors, type Adapter } from 'oidc-provider';
import Sinon from 'sinon';

import { mockApplication } from '#src/__mocks__/index.js';
import { type EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { getProviderConfiguration } from '#src/oidc/oidc-provider-internals.js';
import { createOidcContext } from '#src/test-utils/oidc-provider.js';
import { MockTenant } from '#src/test-utils/tenant.js';

import { buildHandler } from './refresh-token.js';

const { jest } = import.meta;

const assertUserHasApplicationAccess = jest.fn(async () => {
  await Promise.resolve();
});

const mockHandler = (tenant = new MockTenant()) => {
  return buildHandler(tenant.envSet, tenant.queries, { assertUserHasApplicationAccess });
};

const clientId = 'some_client_id';
const grantId = 'some_grant_id';
const accountId = 'some_account_id';
const requestScopes = ['foo', 'bar'];

const mockAdapter: Adapter = {
  upsert: jest.fn(),
  find: jest.fn(),
  findByUserCode: jest.fn(),
  findByUid: jest.fn(),
  consume: jest.fn(),
  destroy: jest.fn(),
  revokeByGrantId: jest.fn(),
};

type RefreshToken = InstanceType<KoaContextWithOIDC['oidc']['provider']['RefreshToken']>;
type Grant = InstanceType<KoaContextWithOIDC['oidc']['provider']['Grant']>;
type Client = InstanceType<KoaContextWithOIDC['oidc']['provider']['Client']>;

const validClient: Client = {
  clientId,
  grantTypeAllowed: jest.fn().mockResolvedValue(true),
  clientAuthMethod: 'none',
  metadata: jest.fn(() => ({ client_id: clientId, appLevelAccessControlEnabled: false })),
} as unknown as Client;

const validRefreshToken: RefreshToken = {
  kind: 'RefreshToken',
  clientId,
  grantId,
  accountId,
  consumed: undefined,
  totalLifetime: jest.fn().mockReturnValue(1),
  isSenderConstrained: jest.fn().mockReturnValue(false),
  consume: jest.fn(),
  iat: 0,
  jti: '',
  scope: [UserScope.Organizations, ...requestScopes].join(' '),
  scopes: new Set([UserScope.Organizations, ...requestScopes]),
  ttlPercentagePassed: jest.fn(),
  isValid: false,
  isExpired: false,
  remainingTTL: 0,
  expiration: 0,
  save: jest.fn(),
  adapter: mockAdapter,
  destroy: jest.fn(),
  emit: jest.fn(),
};

const stubRefreshToken = (ctx: KoaContextWithOIDC, overrides?: Partial<RefreshToken>) => {
  return Sinon.stub(ctx.oidc.provider.RefreshToken, 'find').resolves({
    ...validRefreshToken,
    ...overrides,
  });
};

const validOidcContext: Partial<KoaContextWithOIDC['oidc']> = {
  requestParamScopes: new Set(requestScopes),
  params: {
    refresh_token: 'some_refresh_token',
    organization_id: 'some_org_id',
    scope: requestScopes.join(' '),
  },
  entities: {
    RefreshToken: validRefreshToken,
    Client: validClient,
  },
  client: validClient,
};

const validGrant: Grant = {
  jti: '',
  kind: '',
  iat: 0,
  clientId,
  accountId,
  scopes: new Set<string>(),
  ttlPercentagePassed: jest.fn(),
  isValid: false,
  isExpired: false,
  remainingTTL: 0,
  expiration: 0,
  adapter: mockAdapter,
  addOIDCScope: jest.fn(),
  rejectOIDCScope: jest.fn(),
  getOIDCScope: jest.fn(),
  getOIDCScopeEncountered: jest.fn(),
  getOIDCScopeFiltered: jest.fn(),
  addOIDCClaims: jest.fn(),
  rejectOIDCClaims: jest.fn(),
  getOIDCClaims: jest.fn(),
  getOIDCClaimsEncountered: jest.fn(),
  getOIDCClaimsFiltered: jest.fn(),
  addResourceScope: jest.fn(),
  rejectResourceScope: jest.fn(),
  getResourceScope: jest.fn(),
  getResourceScopeEncountered: jest.fn(),
  getResourceScopeFiltered: jest.fn(),
  save: jest.fn(),
  destroy: jest.fn(),
  emit: jest.fn(),
};

const stubGrant = (
  ctx: KoaContextWithOIDC,
  overrides?: Partial<Grant> & Record<string, unknown>
) => {
  return Sinon.stub(ctx.oidc.provider.Grant, 'find').resolves({
    ...validGrant,
    ...overrides,
  });
};

const stubAccount = (ctx: KoaContextWithOIDC, overrideAccountId = accountId) => {
  return Sinon.stub(getProviderConfiguration(ctx.oidc.provider), 'findAccount').resolves({
    accountId: overrideAccountId,
  });
};

/** The real `IdToken` constructor rejects the mocked plain-object client. */
class StubIdToken {
  scope?: string;
  mask?: unknown;
  rejected?: unknown;
  set = jest.fn();
  issue = jest.fn().mockResolvedValue('stub_id_token');
}

const stubIdToken = (ctx: KoaContextWithOIDC) =>
  Sinon.stub(ctx.oidc.provider, 'IdToken').value(StubIdToken);

const createAccessDeniedError = (message: string, statusCode: number) => {
  const error = new errors.AccessDenied(message);
  // eslint-disable-next-line @silverhand/fp/no-mutation
  error.statusCode = statusCode;
  return error;
};

const createPreparedContext = () => {
  const ctx = createOidcContext(validOidcContext);
  stubRefreshToken(ctx);
  stubGrant(ctx);
  stubAccount(ctx);
  return ctx;
};

beforeAll(() => {
  // `oidc-provider` will warn for dev interactions
  Sinon.stub(console, 'warn');
});

afterAll(() => {
  Sinon.restore();
});

// The handler returns void so we cannot check the return value, and it's also not
// straightforward to assert the token is issued correctly. Here we just do the sanity
// check and basic token validation. Comprehensive token validation should be done in
// integration tests.
describe('refresh token grant', () => {
  afterEach(() => {
    assertUserHasApplicationAccess.mockClear();
  });

  it('should throw when client is not available', async () => {
    const ctx = createOidcContext({ ...validOidcContext, client: undefined });
    await expect(mockHandler()(ctx)).rejects.toThrow(errors.InvalidClient);
  });

  it('should throw when refresh token is not available', async () => {
    const ctx = createOidcContext(validOidcContext);
    await expect(mockHandler()(ctx)).rejects.toMatchError(
      new errors.InvalidGrant('refresh token not found')
    );
  });

  it('should throw when refresh token mismatch client id', async () => {
    const ctx = createOidcContext(validOidcContext);
    stubRefreshToken(ctx, {
      clientId: 'some_other_id',
    });
    await expect(mockHandler()(ctx)).rejects.toMatchError(
      new errors.InvalidGrant('client mismatch')
    );
  });

  it('should throw when refresh token is expired', async () => {
    const ctx = createOidcContext(validOidcContext);
    stubRefreshToken(ctx, {
      isExpired: true,
    });
    await expect(mockHandler()(ctx)).rejects.toMatchError(
      new errors.InvalidGrant('refresh token is expired')
    );
  });

  it('should throw when refresh token has no grant id or the grant cannot be found', async () => {
    const ctx = createOidcContext(validOidcContext);
    const findRefreshToken = stubRefreshToken(ctx, {
      grantId: undefined,
    });
    await expect(mockHandler()(ctx)).rejects.toMatchError(
      new errors.InvalidGrant('grantId not found')
    );

    findRefreshToken.resolves(validRefreshToken);
    Sinon.stub(ctx.oidc.provider.Grant, 'find').resolves();
    await expect(mockHandler()(ctx)).rejects.toMatchError(
      new errors.InvalidGrant('grant not found')
    );
  });

  it('should throw when grant is expired', async () => {
    const ctx = createOidcContext(validOidcContext);
    stubRefreshToken(ctx);
    stubGrant(ctx, {
      isExpired: true,
    });
    await expect(mockHandler()(ctx)).rejects.toMatchError(
      new errors.InvalidGrant('grant is expired')
    );
  });

  it("should throw when grant's client id mismatch", async () => {
    const ctx = createOidcContext(validOidcContext);
    stubRefreshToken(ctx);
    stubGrant(ctx, {
      clientId: 'some_other_id',
    });
    await expect(mockHandler()(ctx)).rejects.toMatchError(
      new errors.InvalidGrant('client mismatch')
    );
  });

  it('should throw when request scopes are not available in refresh token', async () => {
    const ctx = createOidcContext(validOidcContext);
    stubRefreshToken(ctx, {
      scope: UserScope.Organizations,
      scopes: new Set([UserScope.Organizations]),
    });
    stubGrant(ctx);
    await expect(mockHandler()(ctx)).rejects.toThrow(errors.InvalidScope);
  });

  it('should throw when account cannot be found or account id mismatch', async () => {
    const ctx = createOidcContext(validOidcContext);
    stubRefreshToken(ctx);
    const stubbedGrant = stubGrant(ctx);
    const stubFindAccount = Sinon.stub(
      getProviderConfiguration(ctx.oidc.provider),
      'findAccount'
    ).resolves();
    await expect(mockHandler()(ctx)).rejects.toThrow(errors.InvalidGrant);

    stubbedGrant.resolves({ ...validGrant, accountId: 'some_other_id' });
    stubFindAccount.resolves({ accountId });
    await expect(mockHandler()(ctx)).rejects.toMatchError(
      new errors.InvalidGrant('accountId mismatch')
    );
  });

  it('should throw before consuming the refresh token when the user is suspended', async () => {
    const ctx = createOidcContext(validOidcContext);
    const consume = jest.fn();
    stubRefreshToken(ctx, { consume });
    stubGrant(ctx);
    // The suspension check lives in `findAccount` (see `oidc/init.ts`); the grant surfaces its
    // rejection at the account validation step.
    Sinon.stub(getProviderConfiguration(ctx.oidc.provider), 'findAccount').rejects(
      new errors.InvalidGrant('user is suspended')
    );

    await expect(mockHandler()(ctx)).rejects.toMatchError(
      new errors.InvalidGrant('user is suspended')
    );
    expect(consume).not.toHaveBeenCalled();
  });

  it('should throw when refresh token has been consumed', async () => {
    const ctx = createOidcContext(validOidcContext);
    stubRefreshToken(ctx, {
      consumed: new Date(),
    });
    stubGrant(ctx);
    stubAccount(ctx);
    await expect(mockHandler()(ctx)).rejects.toThrow(errors.InvalidGrant);
  });

  it('should throw before refresh token rotation when the user has no application access', async () => {
    const ctx = createPreparedContext();
    const tenant = new MockTenant();
    const accessError = new RequestError('oidc.access_denied');
    assertUserHasApplicationAccess.mockRejectedValueOnce(accessError);

    await expect(mockHandler(tenant)(ctx)).rejects.toThrow(errors.AccessDenied);

    expect(validRefreshToken.consume).not.toHaveBeenCalled();
  });

  it('should throw if the user is not a member of the organization', async () => {
    const ctx = createPreparedContext();
    const tenant = new MockTenant();
    Sinon.stub(tenant.queries.organizations.relations.users, 'exists').resolves(false);
    await expect(mockHandler(tenant)(ctx)).rejects.toThrow(
      createAccessDeniedError('user is not a member of the organization', 403)
    );
  });

  it('should throw if the user has not granted the requested organization', async () => {
    const ctx = createPreparedContext();
    const tenant = new MockTenant();
    Sinon.stub(tenant.queries.organizations.relations.users, 'exists').resolves(true);
    Sinon.stub(tenant.queries.applications, 'findApplicationById').resolves({
      ...mockApplication,
      isThirdParty: true,
    });
    Sinon.stub(tenant.queries.applications.userConsentOrganizations, 'exists').resolves(false);
    await expect(mockHandler(tenant)(ctx)).rejects.toThrow(
      createAccessDeniedError('organization access is not granted to the application', 403)
    );
  });

  it('should throw if the organization requires MFA but the user has not configured it', async () => {
    const ctx = createPreparedContext();
    const tenant = new MockTenant();
    Sinon.stub(tenant.queries.organizations.relations.users, 'exists').resolves(true);
    Sinon.stub(tenant.queries.applications, 'findApplicationById').resolves(mockApplication);
    Sinon.stub(tenant.queries.applications.userConsentOrganizations, 'exists').resolves(true);
    Sinon.stub(tenant.queries.organizations, 'getMfaStatus').resolves({
      isMfaRequired: true,
      hasMfaConfigured: false,
    });
    await expect(mockHandler(tenant)(ctx)).rejects.toThrow(
      createAccessDeniedError('organization requires MFA but user has no MFA configured', 403)
    );
  });

  it('should throw when refresh token has no organization scope', async () => {
    const ctx = createOidcContext({
      ...validOidcContext,
      params: {
        ...validOidcContext.params,
        scope: '',
      },
    });
    const tenant = new MockTenant();
    stubRefreshToken(ctx, {
      scopes: new Set(),
    });
    stubGrant(ctx);
    Sinon.stub(tenant.queries.organizations.relations.users, 'exists').resolves(true);
    Sinon.stub(tenant.queries.applications, 'findApplicationById').resolves(mockApplication);
    Sinon.stub(tenant.queries.organizations.relations.usersRoles, 'getUserScopes').resolves([
      { tenantId: 'default', id: 'foo', name: 'foo', description: 'foo' },
      { tenantId: 'default', id: 'bar', name: 'bar', description: 'bar' },
      { tenantId: 'default', id: 'baz', name: 'baz', description: 'baz' },
    ]);
    Sinon.stub(tenant.queries.organizations, 'getMfaStatus').resolves({
      isMfaRequired: false,
      hasMfaConfigured: false,
    });

    await expect(mockHandler(tenant)(ctx)).rejects.toMatchError(
      new errors.InsufficientScope('refresh token missing required scope', UserScope.Organizations)
    );
  });

  it('should query account claims with the effective scope when the request narrows it', async () => {
    const requestScope = ['openid', ...requestScopes].join(' ');
    const claims = jest.fn().mockResolvedValue({ sub: accountId });
    const ctx = createOidcContext({
      ...validOidcContext,
      requestParamScopes: new Set(['openid', ...requestScopes]),
      // No `organization_id`: this exercises the plain refresh path with an ID token.
      params: { refresh_token: 'some_refresh_token', scope: requestScope },
      // The mocked `entity()` does not populate `ctx.oidc.account`, so provide it directly for
      // the ID token issuance path.
      account: { accountId, claims },
    });
    stubRefreshToken(ctx, {
      scope: ['openid', 'extra', ...requestScopes].join(' '),
      scopes: new Set(['openid', 'extra', ...requestScopes]),
    });
    stubGrant(ctx, { getRejectedOIDCClaims: jest.fn().mockReturnValue([]) });
    stubAccount(ctx);
    stubIdToken(ctx);
    const tenant = new MockTenant();

    await expect(mockHandler(tenant)(ctx)).resolves.toBeUndefined();

    expect(claims).toHaveBeenCalledTimes(1);
    expect(claims.mock.calls[0][0]).toBe('id_token');
    expect(claims.mock.calls[0][1]).toBe(requestScope);
  });

  it('should stop issuing a user scope the client is no longer configured for', async () => {
    const grantedScopes = ['openid', 'profile', 'email'];
    const claims = jest.fn().mockResolvedValue({ sub: accountId });
    const ctx = createOidcContext({
      ...validOidcContext,
      requestParamScopes: new Set(grantedScopes),
      // No `organization_id`: this exercises the plain refresh path with an ID token.
      params: { refresh_token: 'some_refresh_token', scope: grantedScopes.join(' ') },
      /** A third-party client whose consent configuration no longer carries `email`. */
      client: { ...validClient, scope: 'openid offline_access profile' } as unknown as Client,
      account: { accountId, claims },
    });
    stubRefreshToken(ctx, {
      scope: grantedScopes.join(' '),
      scopes: new Set(grantedScopes),
    });
    stubGrant(ctx, {
      getOIDCScopeFiltered: jest.fn((filter: Set<string>) =>
        grantedScopes.filter((scope) => filter.has(scope)).join(' ')
      ),
      getRejectedOIDCClaims: jest.fn().mockReturnValue([]),
    });
    stubAccount(ctx);
    stubIdToken(ctx);

    const entityStub = Sinon.stub(ctx.oidc, 'entity');
    await expect(mockHandler()(ctx)).resolves.toBeUndefined();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- `entity()` args are typed `unknown`; the assertions below narrow them
    const [key, value] = entityStub.lastCall.args;
    expect(key).toBe('AccessToken');
    expect(value).toMatchObject({ scope: 'openid profile' });
    // The dropped scope must not reach the ID token claims either.
    expect(claims.mock.calls[0][1]).toBe('openid profile');
  });

  it('should issue every granted scope the client still allows', async () => {
    const grantedScopes = ['openid', 'profile'];
    const ctx = createOidcContext({
      ...validOidcContext,
      requestParamScopes: new Set(grantedScopes),
      params: { refresh_token: 'some_refresh_token', scope: grantedScopes.join(' ') },
      client: { ...validClient, scope: 'openid offline_access profile' } as unknown as Client,
      account: { accountId, claims: jest.fn().mockResolvedValue({ sub: accountId }) },
    });
    stubRefreshToken(ctx, {
      scope: grantedScopes.join(' '),
      scopes: new Set(grantedScopes),
    });
    stubGrant(ctx, {
      getOIDCScopeFiltered: jest.fn((filter: Set<string>) =>
        grantedScopes.filter((scope) => filter.has(scope)).join(' ')
      ),
      getRejectedOIDCClaims: jest.fn().mockReturnValue([]),
    });
    stubAccount(ctx);
    stubIdToken(ctx);

    const entityStub = Sinon.stub(ctx.oidc, 'entity');
    await expect(mockHandler()(ctx)).resolves.toBeUndefined();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- `entity()` args are typed `unknown`; the assertions below narrow them
    const [key, value] = entityStub.lastCall.args;
    expect(key).toBe('AccessToken');
    expect(value).toMatchObject({ scope: 'openid profile' });
  });

  it('should keep an organization scope sharing its name with a no-longer-allowed user scope', async () => {
    const requested = [UserScope.Organizations, UserScope.Email];
    const ctx = createOidcContext({
      ...validOidcContext,
      requestParamScopes: new Set(requested),
      params: {
        refresh_token: 'some_refresh_token',
        organization_id: 'some_org_id',
        scope: requested.join(' '),
      },
      /** `email` is no longer in the consent configuration, but is also an organization role scope. */
      client: {
        ...validClient,
        scope: ['openid', 'offline_access', UserScope.Organizations].join(' '),
      } as unknown as Client,
    });
    stubRefreshToken(ctx, {
      scope: requested.join(' '),
      scopes: new Set(requested),
    });
    stubGrant(ctx, {
      getOIDCScopeFiltered: jest.fn((filter: Set<string>) =>
        requested.filter((scope) => filter.has(scope)).join(' ')
      ),
    });
    stubAccount(ctx);
    const tenant = new MockTenant();

    Sinon.stub(tenant.queries.organizations.relations.users, 'exists').resolves(true);
    Sinon.stub(tenant.queries.applications, 'findApplicationById').resolves(mockApplication);
    Sinon.stub(tenant.queries.organizations.relations.usersRoles, 'getUserScopes').resolves([
      { tenantId: 'default', id: 'email', name: UserScope.Email, description: null },
    ]);
    Sinon.stub(tenant.queries.organizations, 'getMfaStatus').resolves({
      isMfaRequired: false,
      hasMfaConfigured: false,
    });

    const entityStub = Sinon.stub(ctx.oidc, 'entity');
    await expect(mockHandler(tenant)(ctx)).resolves.toBeUndefined();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- `entity()` args are typed `unknown`; the assertions below narrow them
    const [key, value] = entityStub.lastCall.args;
    expect(key).toBe('AccessToken');
    expect(value).toMatchObject({
      scope: UserScope.Email,
      aud: 'urn:logto:organization:some_org_id',
    });
  });

  it('should reject an organization token when the client no longer allows the organizations scope', async () => {
    const requested = [UserScope.Organizations, UserScope.Email];
    const ctx = createOidcContext({
      ...validOidcContext,
      requestParamScopes: new Set(requested),
      params: {
        refresh_token: 'some_refresh_token',
        organization_id: 'some_org_id',
        scope: requested.join(' '),
      },
      client: {
        ...validClient,
        scope: ['openid', 'offline_access', UserScope.Email].join(' '),
      } as unknown as Client,
    });
    stubRefreshToken(ctx, {
      scope: requested.join(' '),
      scopes: new Set(requested),
    });
    stubGrant(ctx, {
      getOIDCScopeFiltered: jest.fn((filter: Set<string>) =>
        requested.filter((scope) => filter.has(scope)).join(' ')
      ),
    });
    stubAccount(ctx);
    const tenant = new MockTenant();
    Sinon.stub(tenant.queries.organizations.relations.users, 'exists').resolves(true);
    Sinon.stub(tenant.queries.applications, 'findApplicationById').resolves(mockApplication);
    Sinon.stub(tenant.queries.organizations, 'getMfaStatus').resolves({
      isMfaRequired: false,
      hasMfaConfigured: false,
    });

    await expect(mockHandler(tenant)(ctx)).rejects.toMatchError(
      new errors.InsufficientScope(
        'requested scope is no longer allowed for the client',
        UserScope.Organizations
      )
    );
  });

  it('should not explode when everything looks fine', async () => {
    const ctx = createPreparedContext();
    const tenant = new MockTenant();

    Sinon.stub(tenant.queries.organizations.relations.users, 'exists').resolves(true);
    Sinon.stub(tenant.queries.applications, 'findApplicationById').resolves(mockApplication);
    Sinon.stub(tenant.queries.organizations.relations.usersRoles, 'getUserScopes').resolves([
      { tenantId: 'default', id: 'foo', name: 'foo', description: 'foo' },
      { tenantId: 'default', id: 'bar', name: 'bar', description: 'bar' },
      { tenantId: 'default', id: 'baz', name: 'baz', description: 'baz' },
    ]);
    Sinon.stub(tenant.queries.organizations, 'getMfaStatus').resolves({
      isMfaRequired: false,
      hasMfaConfigured: false,
    });

    const entityStub = Sinon.stub(ctx.oidc, 'entity');
    await expect(mockHandler(tenant)(ctx)).resolves.toBeUndefined();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const [key, value] = entityStub.lastCall.args;
    expect(key).toBe('AccessToken');
    expect(value).toMatchObject({
      accountId,
      clientId,
      grantId,
      scope: requestScopes.join(' '),
      aud: 'urn:logto:organization:some_org_id',
    });
  });
});

describe('refresh token grant for CIMD clients', () => {
  const cimdClientId = 'https://client.example.com/metadata.json';

  /**
   * The gate reads only `oidc.cimdEnabled` from the tenant env set; the jest environment keeps
   * the dev-features and SSRF-protection static flags on already.
   */
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- minimal env-set stub scoped to the field the gate reads
  const cimdEnvSet = { oidc: { cimdEnabled: true } } as EnvSet;

  const cimdClient: Client = {
    clientId: cimdClientId,
    grantTypeAllowed: jest.fn().mockResolvedValue(true),
    clientAuthMethod: 'none',
    metadata: jest.fn(() => ({ client_id: cimdClientId })),
  } as unknown as Client;

  const buildCimdHandler = (tenant: MockTenant, envSet: EnvSet = cimdEnvSet) =>
    buildHandler(envSet, tenant.queries, { assertUserHasApplicationAccess });

  const createCimdPreparedContext = (
    params = validOidcContext.params,
    grantOverrides?: Partial<Grant> & Record<string, unknown>
  ) => {
    const ctx = createOidcContext({
      ...validOidcContext,
      params,
      entities: { ...validOidcContext.entities, Client: cimdClient },
      client: cimdClient,
    });
    stubRefreshToken(ctx, { clientId: cimdClientId });
    stubGrant(ctx, { clientId: cimdClientId, ...grantOverrides });
    stubAccount(ctx);
    return ctx;
  };

  afterEach(() => {
    assertUserHasApplicationAccess.mockClear();
  });

  it('should skip the application access check without an organization_id', async () => {
    const ctx = createCimdPreparedContext({
      ...validOidcContext.params,
      organization_id: undefined,
    });
    const tenant = new MockTenant();

    const findApplicationById = Sinon.stub(tenant.queries.applications, 'findApplicationById');

    await expect(buildCimdHandler(tenant)(ctx)).resolves.toBeUndefined();

    expect(assertUserHasApplicationAccess).not.toHaveBeenCalled();
    expect(findApplicationById.called).toBe(false);
  });

  it('should throw if the organization is not authorized on the grant', async () => {
    const ctx = createCimdPreparedContext();
    const tenant = new MockTenant();

    Sinon.stub(tenant.queries.organizations.relations.users, 'exists').resolves(true);
    const grantOrganizationExists = Sinon.stub(
      tenant.queries.cimd.grantOrganizations,
      'exists'
    ).resolves(false);
    const findApplicationById = Sinon.stub(tenant.queries.applications, 'findApplicationById');
    const userConsentOrganizationExists = Sinon.stub(
      tenant.queries.applications.userConsentOrganizations,
      'exists'
    );

    await expect(buildCimdHandler(tenant)(ctx)).rejects.toMatchError(
      createAccessDeniedError('organization access is not granted to the application', 403)
    );

    // The check keys on the grant behind the refresh token, off the application relations.
    expect(grantOrganizationExists.calledOnceWith(grantId, 'some_org_id')).toBe(true);
    expect(findApplicationById.called).toBe(false);
    expect(userConsentOrganizationExists.called).toBe(false);
  });

  it('should bound the organization token scopes by the grant record and the tenant ceiling', async () => {
    // The Grant recorded only `foo` under the organization resource.
    const ctx = createCimdPreparedContext(validOidcContext.params, {
      getResourceScope: jest.fn().mockReturnValue('foo'),
    });
    const tenant = new MockTenant();

    Sinon.stub(tenant.queries.organizations.relations.users, 'exists').resolves(true);
    Sinon.stub(tenant.queries.cimd.grantOrganizations, 'exists').resolves(true);
    Sinon.stub(tenant.queries.organizations.relations.usersRoles, 'getUserScopes').resolves([
      { tenantId: 'default', id: 'foo', name: 'foo', description: 'foo' },
      { tenantId: 'default', id: 'bar', name: 'bar', description: 'bar' },
      { tenantId: 'default', id: 'baz', name: 'baz', description: 'baz' },
    ]);
    // `foo` and `bar` sit inside the tenant-wide organization-scope ceiling.
    Sinon.stub(tenant.queries.cimd.organizationScopes, 'findAll').resolves([
      { tenantId: 'default', id: 'foo', name: 'foo', description: 'foo' },
      { tenantId: 'default', id: 'bar', name: 'bar', description: 'bar' },
    ]);
    Sinon.stub(tenant.queries.organizations, 'getMfaStatus').resolves({
      isMfaRequired: false,
      hasMfaConfigured: false,
    });

    const entityStub = Sinon.stub(ctx.oidc, 'entity');
    await expect(buildCimdHandler(tenant)(ctx)).resolves.toBeUndefined();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- `entity()` args are typed `unknown`; the assertions below narrow them
    const [key, value] = entityStub.lastCall.args;
    expect(key).toBe('AccessToken');
    expect(value).toMatchObject({
      accountId,
      clientId: cimdClientId,
      grantId,
      // Requested `foo bar` ∩ role scopes ∩ ceiling (`foo bar`) ∩ grant record (`foo`):
      // `bar` survives the ceiling but was never granted under the organization resource.
      scope: 'foo',
      aud: 'urn:logto:organization:some_org_id',
    });
  });

  it('should keep the application access check for a url client id when CIMD is not effectively enabled', async () => {
    const ctx = createCimdPreparedContext();
    const tenant = new MockTenant();
    assertUserHasApplicationAccess.mockRejectedValueOnce(new RequestError('oidc.access_denied'));

    await expect(buildCimdHandler(tenant, tenant.envSet)(ctx)).rejects.toThrow(errors.AccessDenied);
    expect(assertUserHasApplicationAccess).toHaveBeenCalled();
  });
});
/* eslint-enable max-lines */
