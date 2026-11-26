import { ReservedResource, UserScope } from '@logto/core-kit';
import Sinon from 'sinon';

import { mockApplication } from '#src/__mocks__/index.js';
import { createOidcContext } from '#src/test-utils/oidc-provider.js';
import { MockTenant } from '#src/test-utils/tenant.js';

import {
  accountId,
  assertUserHasApplicationAccess,
  clientId,
  createReservedOrgResourceRefreshContext,
  grantId,
  mockHandler,
  stubAccount,
  stubGrant,
  stubOrganizationMfa,
  stubRefreshToken,
  validClient,
  validOidcContext,
  type Client,
} from './refresh-token.test-utils.js';

const { jest } = import.meta;

const createThirdPartyTenant = ({
  roleScopes,
  enabledOrganizationScopes,
}: {
  roleScopes: string[];
  enabledOrganizationScopes: string[];
}) => {
  const tenant = new MockTenant();
  Sinon.stub(tenant.queries.organizations.relations.users, 'exists').resolves(true);
  const findApplicationById = Sinon.stub(
    tenant.queries.applications,
    'findApplicationById'
  ).resolves({
    ...mockApplication,
    id: clientId,
    isThirdParty: true,
  });
  Sinon.stub(tenant.queries.applications.userConsentOrganizations, 'exists').resolves(true);
  Sinon.stub(tenant.queries.organizations.relations.usersRoles, 'getUserScopes').resolves(
    roleScopes.map((name) => ({ tenantId: 'default', id: name, name, description: null }))
  );
  const getApplicationUserConsentOrganizationScopes = Sinon.stub(
    tenant.libraries.applications,
    'getApplicationUserConsentOrganizationScopes'
  ).resolves(
    enabledOrganizationScopes.map((name) => ({
      tenantId: 'default',
      id: name,
      name,
      description: null,
    }))
  );
  stubOrganizationMfa(tenant);
  return { tenant, findApplicationById, getApplicationUserConsentOrganizationScopes };
};

const createThirdPartyContext = ({
  refreshTokenScopes,
  grantedOrganizationScopes,
  clientScope,
}: {
  refreshTokenScopes: string[];
  grantedOrganizationScopes: string;
  clientScope?: string;
}) => {
  const client = {
    ...validClient,
    ...(clientScope ? { scope: clientScope } : {}),
  } as unknown as Client;
  const ctx = createOidcContext({
    ...validOidcContext,
    requestParamScopes: new Set(),
    params: {
      refresh_token: 'some_refresh_token',
      organization_id: 'some_org_id',
    },
    entities: { ...validOidcContext.entities, Client: client },
    client,
  });
  stubRefreshToken(ctx, {
    scope: refreshTokenScopes.join(' '),
    scopes: new Set(refreshTokenScopes),
  });
  const getResourceScope = jest.fn((resource: string) =>
    resource === ReservedResource.Organization ? grantedOrganizationScopes : ''
  );
  stubGrant(ctx, {
    getResourceScope,
    getOIDCScopeFiltered: jest.fn((filter: Set<string>) =>
      refreshTokenScopes.filter((scope) => filter.has(scope)).join(' ')
    ),
  });
  stubAccount(ctx);
  return { ctx, getResourceScope };
};

beforeAll(() => {
  // `oidc-provider` will warn for dev interactions
  Sinon.stub(console, 'warn');
});

afterAll(() => {
  Sinon.restore();
});

describe('refresh token grant for registered third-party applications', () => {
  afterEach(() => {
    assertUserHasApplicationAccess.mockClear();
  });

  it('should issue enabled and consented organization scopes normally', async () => {
    const { tenant, findApplicationById, getApplicationUserConsentOrganizationScopes } =
      createThirdPartyTenant({
        roleScopes: ['invite:member', 'manage:billing'],
        enabledOrganizationScopes: ['invite:member', 'manage:billing'],
      });
    const { ctx, getResourceScope } = createThirdPartyContext({
      refreshTokenScopes: [UserScope.Organizations, 'invite:member', 'manage:billing'],
      grantedOrganizationScopes: 'invite:member manage:billing',
    });

    const entityStub = Sinon.stub(ctx.oidc, 'entity');
    await expect(mockHandler(tenant)(ctx)).resolves.toBeUndefined();

    expect(findApplicationById.calledOnceWith(clientId)).toBe(true);
    expect(getApplicationUserConsentOrganizationScopes.calledOnceWith(clientId)).toBe(true);
    expect(getResourceScope).toHaveBeenCalledWith(ReservedResource.Organization);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- `entity()` args are typed `unknown`; the assertions below narrow them
    const [key, value] = entityStub.lastCall.args;
    expect(key).toBe('AccessToken');
    expect(value).toMatchObject({
      accountId,
      clientId,
      grantId,
      scope: 'invite:member manage:billing',
      aud: 'urn:logto:organization:some_org_id',
    });
  });

  it('should not leak a same-named API resource scope when disabled in app organizationScopes or absent from Grant[Org]', async () => {
    // `read` entered RT.scope via an API resource and is disabled in app organizationScopes;
    // `audit:log` entered RT.scope via an API resource and is enabled in app organizationScopes
    // but was never consented under Grant[urn:logto:resource:organizations].
    const { tenant } = createThirdPartyTenant({
      roleScopes: ['invite:member', 'read', 'audit:log'],
      enabledOrganizationScopes: ['invite:member', 'audit:log'],
    });
    const { ctx } = createThirdPartyContext({
      refreshTokenScopes: [UserScope.Organizations, 'invite:member', 'read', 'audit:log'],
      grantedOrganizationScopes: 'invite:member',
    });

    const entityStub = Sinon.stub(ctx.oidc, 'entity');
    await expect(mockHandler(tenant)(ctx)).resolves.toBeUndefined();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- `entity()` args are typed `unknown`; the assertions below narrow them
    const [key, value] = entityStub.lastCall.args;
    expect(key).toBe('AccessToken');
    expect(value).toMatchObject({
      scope: 'invite:member',
      aud: 'urn:logto:organization:some_org_id',
    });
  });

  it('should not leak a same-named OIDC scope when absent from Grant[Org] even if enabled in app organizationScopes', async () => {
    // Contrast with first-party behavior: even when `email` is in RT.scope (from OIDC scope),
    // enabled in app organizationScopes, and held in the user's organization role, a registered
    // third-party app must not receive it unless consented under Grant[urn:logto:resource:organizations].
    const { tenant } = createThirdPartyTenant({
      roleScopes: ['invite:member', UserScope.Email],
      enabledOrganizationScopes: ['invite:member', UserScope.Email],
    });
    const { ctx } = createThirdPartyContext({
      refreshTokenScopes: [UserScope.Organizations, UserScope.Email, 'invite:member'],
      grantedOrganizationScopes: 'invite:member',
      clientScope: ['openid', 'offline_access', UserScope.Organizations, UserScope.Email].join(' '),
    });

    const entityStub = Sinon.stub(ctx.oidc, 'entity');
    await expect(mockHandler(tenant)(ctx)).resolves.toBeUndefined();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- `entity()` args are typed `unknown`; the assertions below narrow them
    const [key, value] = entityStub.lastCall.args;
    expect(key).toBe('AccessToken');
    expect(value).toMatchObject({
      scope: 'invite:member',
      aud: 'urn:logto:organization:some_org_id',
    });
  });

  it('should stop issuing an organization scope once removed from the third-party app config', async () => {
    // Both `invite:member` and `manage:billing` were previously consented (present in RT.scope and
    // Grant[Org]), then an admin removed `manage:billing` from the app's organizationScopes.
    const { tenant } = createThirdPartyTenant({
      roleScopes: ['invite:member', 'manage:billing'],
      enabledOrganizationScopes: ['invite:member'],
    });
    const { ctx } = createThirdPartyContext({
      refreshTokenScopes: [UserScope.Organizations, 'invite:member', 'manage:billing'],
      grantedOrganizationScopes: 'invite:member manage:billing',
    });

    const entityStub = Sinon.stub(ctx.oidc, 'entity');
    await expect(mockHandler(tenant)(ctx)).resolves.toBeUndefined();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- `entity()` args are typed `unknown`; the assertions below narrow them
    const [key, value] = entityStub.lastCall.args;
    expect(key).toBe('AccessToken');
    expect(value).toMatchObject({
      scope: 'invite:member',
      aud: 'urn:logto:organization:some_org_id',
    });
  });

  it('should issue an empty scope when Grant[Org] has no organization scopes', async () => {
    const { tenant } = createThirdPartyTenant({
      roleScopes: ['read'],
      enabledOrganizationScopes: ['read'],
    });
    const { ctx } = createThirdPartyContext({
      refreshTokenScopes: [UserScope.Organizations, 'read'],
      grantedOrganizationScopes: '',
    });

    const entityStub = Sinon.stub(ctx.oidc, 'entity');
    await expect(mockHandler(tenant)(ctx)).resolves.toBeUndefined();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- `entity()` args are typed `unknown`; the assertions below narrow them
    const [key, value] = entityStub.lastCall.args;
    expect(key).toBe('AccessToken');
    expect(value).toMatchObject({
      scope: '',
      aud: 'urn:logto:organization:some_org_id',
    });
  });

  it.each([
    {
      label: 'OAuth-only implicit fallback (omitted openid, no resource param)',
      params: { refresh_token: 'some_refresh_token' },
    },
    {
      label: 'explicit resource=ReservedResource.Organization with organization_id',
      params: {
        refresh_token: 'some_refresh_token',
        organization_id: 'some_org_id',
        resource: ReservedResource.Organization,
      },
    },
  ])('Case 4: should issue empty scope without throwing on $label', async ({ params }) => {
    const { tenant } = createThirdPartyTenant({
      roleScopes: ['invite:member'],
      enabledOrganizationScopes: ['invite:member'],
    });
    const ctx = createReservedOrgResourceRefreshContext({
      tenant,
      client: validClient,
      refreshTokenScopes: [UserScope.Organizations, 'invite:member'],
      params,
    });

    const entityStub = Sinon.stub(ctx.oidc, 'entity');
    await expect(mockHandler(tenant)(ctx)).resolves.toBeUndefined();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- `entity()` args are typed `unknown`; the assertions below narrow them
    const [key, value] = entityStub.lastCall.args;
    expect(key).toBe('AccessToken');
    expect(value).toMatchObject({ scope: '' });
  });
});
