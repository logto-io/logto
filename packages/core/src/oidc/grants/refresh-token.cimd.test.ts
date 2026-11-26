import { errors } from 'oidc-provider';
import Sinon from 'sinon';

import { type EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { createOidcContext } from '#src/test-utils/oidc-provider.js';
import { MockTenant } from '#src/test-utils/tenant.js';

import { buildHandler } from './refresh-token.js';
import {
  accountId,
  assertUserHasApplicationAccess,
  createAccessDeniedError,
  grantId,
  stubAccount,
  stubGrant,
  stubOrganizationMfa,
  stubRefreshToken,
  validOidcContext,
  type Client,
  type Grant,
} from './refresh-token.test-utils.js';

const { jest } = import.meta;

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
  buildHandler(envSet, tenant.queries, {
    applicationAccessControl: { assertUserHasApplicationAccess },
    applications: tenant.libraries.applications,
  });

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

beforeAll(() => {
  // `oidc-provider` will warn for dev interactions
  Sinon.stub(console, 'warn');
});

afterAll(() => {
  Sinon.restore();
});

describe('refresh token grant for CIMD clients', () => {
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
    stubOrganizationMfa(tenant);

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
