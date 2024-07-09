import { UserScope } from '@logto/core-kit';
import { type KoaContextWithOIDC, errors, type Adapter } from 'oidc-provider';
import Sinon from 'sinon';

import { mockApplication } from '#src/__mocks__/index.js';
import { createOidcContext } from '#src/test-utils/oidc-provider.js';
import { MockTenant } from '#src/test-utils/tenant.js';

import { buildHandler } from './refresh-token.js';

const { jest } = import.meta;

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = async () => {};

const mockHandler = (tenant = new MockTenant()) => {
  return buildHandler(tenant.envSet, tenant.queries);
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

// @ts-expect-error
const validClient: Client = {
  clientId,
  grantTypeAllowed: jest.fn().mockResolvedValue(true),
  clientAuthMethod: 'none',
};

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
  clientId,
  accountId,
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
  return Sinon.stub(ctx.oidc.provider.Account, 'findAccount').resolves({
    accountId: overrideAccountId,
  });
};

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
  it('should throw when client is not available', async () => {
    const ctx = createOidcContext({ ...validOidcContext, client: undefined });
    await expect(mockHandler()(ctx, noop)).rejects.toThrow(errors.InvalidClient);
  });

  it('should throw when refresh token is not available', async () => {
    const ctx = createOidcContext(validOidcContext);
    await expect(mockHandler()(ctx, noop)).rejects.toMatchError(
      new errors.InvalidGrant('refresh token not found')
    );
  });

  it('should throw when refresh token mismatch client id', async () => {
    const ctx = createOidcContext(validOidcContext);
    stubRefreshToken(ctx, {
      clientId: 'some_other_id',
    });
    await expect(mockHandler()(ctx, noop)).rejects.toMatchError(
      new errors.InvalidGrant('client mismatch')
    );
  });

  it('should throw when refresh token is expired', async () => {
    const ctx = createOidcContext(validOidcContext);
    stubRefreshToken(ctx, {
      isExpired: true,
    });
    await expect(mockHandler()(ctx, noop)).rejects.toMatchError(
      new errors.InvalidGrant('refresh token is expired')
    );
  });

  it('should throw when refresh token has no grant id or the grant cannot be found', async () => {
    const ctx = createOidcContext(validOidcContext);
    const findRefreshToken = stubRefreshToken(ctx, {
      grantId: undefined,
    });
    await expect(mockHandler()(ctx, noop)).rejects.toMatchError(
      new errors.InvalidGrant('grantId not found')
    );

    findRefreshToken.resolves(validRefreshToken);
    Sinon.stub(ctx.oidc.provider.Grant, 'find').resolves();
    await expect(mockHandler()(ctx, noop)).rejects.toMatchError(
      new errors.InvalidGrant('grant not found')
    );
  });

  it('should throw when grant is expired', async () => {
    const ctx = createOidcContext(validOidcContext);
    stubRefreshToken(ctx);
    stubGrant(ctx, {
      isExpired: true,
    });
    await expect(mockHandler()(ctx, noop)).rejects.toMatchError(
      new errors.InvalidGrant('grant is expired')
    );
  });

  it("should throw when grant's client id mismatch", async () => {
    const ctx = createOidcContext(validOidcContext);
    stubRefreshToken(ctx);
    stubGrant(ctx, {
      clientId: 'some_other_id',
    });
    await expect(mockHandler()(ctx, noop)).rejects.toMatchError(
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
    await expect(mockHandler()(ctx, noop)).rejects.toThrow(errors.InvalidScope);
  });

  it('should throw when account cannot be found or account id mismatch', async () => {
    const ctx = createOidcContext(validOidcContext);
    stubRefreshToken(ctx);
    const stubbedGrant = stubGrant(ctx);
    const stubFindAccount = Sinon.stub(ctx.oidc.provider.Account, 'findAccount').resolves();
    await expect(mockHandler()(ctx, noop)).rejects.toThrow(errors.InvalidGrant);

    stubbedGrant.resolves({ ...validGrant, accountId: 'some_other_id' });
    stubFindAccount.resolves({ accountId });
    await expect(mockHandler()(ctx, noop)).rejects.toMatchError(
      new errors.InvalidGrant('accountId mismatch')
    );
  });

  it('should throw when refresh token has been consumed', async () => {
    const ctx = createOidcContext(validOidcContext);
    stubRefreshToken(ctx, {
      consumed: new Date(),
    });
    stubGrant(ctx);
    stubAccount(ctx);
    await expect(mockHandler()(ctx, noop)).rejects.toThrow(errors.InvalidGrant);
  });

  it('should throw if the user is not a member of the organization', async () => {
    const ctx = createPreparedContext();
    const tenant = new MockTenant();
    Sinon.stub(tenant.queries.organizations.relations.users, 'exists').resolves(false);
    await expect(mockHandler(tenant)(ctx, noop)).rejects.toThrow(
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
    await expect(mockHandler(tenant)(ctx, noop)).rejects.toThrow(
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
    await expect(mockHandler(tenant)(ctx, noop)).rejects.toThrow(
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

    await expect(mockHandler(tenant)(ctx, noop)).rejects.toMatchError(
      new errors.InsufficientScope('refresh token missing required scope', UserScope.Organizations)
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
    const noopStub = Sinon.stub().resolves();

    await expect(mockHandler(tenant)(ctx, noopStub)).resolves.toBeUndefined();
    expect(noopStub.callCount).toBe(1);

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
