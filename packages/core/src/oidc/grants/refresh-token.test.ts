import { UserScope } from '@logto/core-kit';
import { MfaFactor } from '@logto/schemas';
import { errors } from 'oidc-provider';
import Sinon from 'sinon';

import { mockApplication } from '#src/__mocks__/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { getProviderConfiguration } from '#src/oidc/oidc-provider-internals.js';
import { createOidcContext } from '#src/test-utils/oidc-provider.js';
import { MockTenant } from '#src/test-utils/tenant.js';

import {
  accountId,
  assertUserHasApplicationAccess,
  clientId,
  createAccessDeniedError,
  createPreparedContext,
  grantId,
  mockHandler,
  requestScopes,
  stubAccount,
  stubGrant,
  stubIdToken,
  stubOrganizationMfa,
  stubRefreshToken,
  validClient,
  validGrant,
  validOidcContext,
  validRefreshToken,
  type Client,
} from './refresh-token.test-utils.js';

const { jest } = import.meta;

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
    stubOrganizationMfa(tenant, [MfaFactor.TOTP]);
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
    stubOrganizationMfa(tenant);

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
    stubOrganizationMfa(tenant);

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
    stubOrganizationMfa(tenant);

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
    stubOrganizationMfa(tenant);

    const entityStub = Sinon.stub(ctx.oidc, 'entity');
    await expect(mockHandler(tenant)(ctx)).resolves.toBeUndefined();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- `entity()` args are typed `unknown`; the assertions below narrow them
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
