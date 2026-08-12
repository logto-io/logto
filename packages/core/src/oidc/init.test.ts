/* eslint-disable max-lines -- provider init tests share one harness; splitting fragments the shared mock setup. */
import assert from 'node:assert';

import { defaultTenantId, GrantType, logtoCookieKey, type Scope } from '@logto/schemas';
import { errors, type KoaContextWithOIDC } from 'oidc-provider';

import { mockResource, mockUser } from '#src/__mocks__/index.js';
import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { getProviderConfiguration } from '#src/oidc/oidc-provider-internals.js';
import { mockEnvSet } from '#src/test-utils/env-set.js';
import { createOidcContext } from '#src/test-utils/oidc-provider.js';
import { MockTenant } from '#src/test-utils/tenant.js';

import {
  appLevelAccessControlMetadataKey,
  hasAppLevelAccessControlChecked,
  markAppLevelAccessControlChecked,
} from './application-access-control.js';
import initOidc from './init.js';

const { jest } = import.meta;

const indicator = 'https://foo.logto.io/api';
const clientId = 'client_id';
const accountId = 'account_id';
const resourceId = 'resource_id';

const buildScope = (id: string, name: string): Scope => ({
  tenantId: 'tenant_id',
  id,
  resourceId,
  name,
  description: null,
  createdAt: 0,
});

const getResourceServerInfo = async (ctx: KoaContextWithOIDC, indicator: string) => {
  const configuration = getProviderConfiguration(ctx.oidc.provider);
  assert(ctx.oidc.client);
  return configuration.features.resourceIndicators.getResourceServerInfo(
    ctx,
    indicator,
    ctx.oidc.client
  );
};

const createProvider = (tenant: MockTenant) =>
  initOidc(
    tenant.id,
    tenant.envSet,
    tenant.queries,
    tenant.libraries,
    tenant.logtoConfigs,
    tenant.subscription
  );

/**
 * The jest-level `loadOidcValues` mock leaves `jwkSigningAlg` undefined, which matches how RSA
 * tenants load. Asserting the EC-tenant provider defaults needs an env set that carries the
 * algorithm derived from the tenant key.
 */
class MockEcEnvSet extends EnvSet {
  override get oidc(): EnvSet['oidc'] {
    return { ...mockEnvSet.oidc, jwkSigningAlg: 'ES384' };
  }
}

const ecEnvSet = new MockEcEnvSet(defaultTenantId, EnvSet.values.dbUrl);

/**
 * The tenant-level `cimdEnabled` flag is the only effective-enablement input the jest
 * environment leaves off (dev features and SSRF protection are both on), so flipping it is
 * enough to exercise the CIMD paths.
 */
class MockCimdEnvSet extends EnvSet {
  override get oidc(): EnvSet['oidc'] {
    return { ...mockEnvSet.oidc, cimdEnabled: true };
  }
}

const cimdEnvSet = new MockCimdEnvSet(defaultTenantId, EnvSet.values.dbUrl);

const createTestClient = (): KoaContextWithOIDC['oidc']['client'] => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- minimal client stub for OIDC context testing
  return {
    clientId,
    metadata: () => ({ appLevelAccessControlEnabled: true }),
  } as KoaContextWithOIDC['oidc']['client'];
};

const mockGrantFound = (provider: KoaContextWithOIDC['oidc']['provider']) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- minimal grant stub for OIDC context testing
  const grant = {} as Awaited<ReturnType<typeof provider.Grant.find>>;

  return jest.spyOn(provider.Grant, 'find').mockResolvedValueOnce(grant);
};

const createContext = (
  provider: KoaContextWithOIDC['oidc']['provider'],
  {
    grantType,
    organizationId,
    clientId: contextClientId = clientId,
  }: { grantType: GrantType; organizationId?: string; clientId?: string }
) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- minimal client stub for OIDC context testing
  const client: KoaContextWithOIDC['oidc']['client'] = {
    clientId: contextClientId,
  } as KoaContextWithOIDC['oidc']['client'];
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- minimal account stub for OIDC context testing
  const account: KoaContextWithOIDC['oidc']['entities']['Account'] = {
    accountId,
    claims: async () => ({ sub: accountId }),
  } as KoaContextWithOIDC['oidc']['entities']['Account'];

  return createOidcContext({
    provider,
    client,
    params: {
      grant_type: grantType,
      ...(organizationId ? { organization_id: organizationId } : {}),
    },
    entities: {
      Account: account,
    },
  });
};

describe('oidc provider init', () => {
  it('init should not throw', async () => {
    const { id, queries, libraries, logtoConfigs, subscription } = new MockTenant();

    expect(() =>
      initOidc(id, mockEnvSet, queries, libraries, logtoConfigs, subscription)
    ).not.toThrow();
  });

  it('should align the default id_token_signed_response_alg with the tenant signing key', () => {
    const { id, queries, libraries, logtoConfigs, subscription } = new MockTenant();
    const provider = initOidc(id, ecEnvSet, queries, libraries, logtoConfigs, subscription);
    const { clientDefaults } = getProviderConfiguration(provider);

    expect(clientDefaults.id_token_signed_response_alg).toBe('ES384');
    // The configured override merges per property; the other built-in defaults must survive.
    expect(clientDefaults.grant_types).toEqual(['authorization_code']);
    expect(clientDefaults.response_types).toEqual(['code']);
    expect(clientDefaults.token_endpoint_auth_method).toBe('client_secret_basic');
  });

  it('should keep the built-in RS256 default when the tenant key derives no signing algorithm', () => {
    const provider = createProvider(new MockTenant());
    const { clientDefaults } = getProviderConfiguration(provider);

    expect(clientDefaults.id_token_signed_response_alg).toBe('RS256');
  });

  it('should allow missing application access control client metadata', async () => {
    const tenant = new MockTenant();
    const provider = createProvider(tenant);
    const configuration = getProviderConfiguration(provider);
    const ctx = createOidcContext({ provider });

    expect(() =>
      configuration.extraClientMetadata.validator(
        ctx,
        appLevelAccessControlMetadataKey,
        undefined,
        { client_id: clientId }
      )
    ).not.toThrow();
  });

  it('should reject invalid application access control client metadata', async () => {
    const tenant = new MockTenant();
    const provider = createProvider(tenant);
    const configuration = getProviderConfiguration(provider);
    const ctx = createOidcContext({ provider });

    expect(() =>
      configuration.extraClientMetadata.validator(ctx, appLevelAccessControlMetadataKey, 'true', {
        client_id: clientId,
      })
    ).toThrow(errors.InvalidClientMetadata);
  });

  it('should reflect updated resource data on token exchange read path', async () => {
    const findResourceByIndicator = jest
      .fn()
      .mockResolvedValueOnce({
        ...mockResource,
        indicator,
        accessTokenTtl: 3600,
      })
      .mockResolvedValueOnce({
        ...mockResource,
        indicator,
        accessTokenTtl: 7200,
      });
    const findApplicationById = jest.fn().mockResolvedValue({ isThirdParty: false });
    const findUserScopesForResourceIndicator = jest
      .fn()
      .mockResolvedValue([buildScope('scope_1', 'read:api')]);
    const tenant = new MockTenant(undefined, {
      resources: { findResourceByIndicator },
      applications: { findApplicationById },
    });

    tenant.setPartial('libraries', {
      users: { findUserScopesForResourceIndicator },
    });

    const provider = createProvider(tenant);
    const ctx = createContext(provider, {
      grantType: GrantType.TokenExchange,
      organizationId: 'org_1',
    });

    const result1 = await getResourceServerInfo(ctx, indicator);
    const result2 = await getResourceServerInfo(ctx, indicator);

    expect(result1.accessTokenTTL).toBe(3600);
    expect(result2.accessTokenTTL).toBe(7200);
    expect(findResourceByIndicator).toHaveBeenCalledTimes(2);
    expect(findApplicationById).toHaveBeenCalledTimes(2);
    expect(findUserScopesForResourceIndicator).toHaveBeenCalledTimes(2);
  });

  it('should not reuse cached resource server info across organizations', async () => {
    const findResourceByIndicator = jest.fn().mockResolvedValue({
      ...mockResource,
      indicator,
      accessTokenTtl: 3600,
    });
    const findUserScopesForResourceIndicator = jest.fn(
      async (
        _userId: string,
        _indicator: string,
        _findFromOrganizations?: boolean,
        orgId?: string
      ) =>
        orgId === 'org_2'
          ? [buildScope('scope_2', 'write:api')]
          : [buildScope('scope_1', 'read:api')]
    );
    const tenant = new MockTenant(undefined, {
      resources: {
        findResourceByIndicator,
      },
      applications: { findApplicationById: jest.fn().mockResolvedValue({ isThirdParty: false }) },
    });

    tenant.setPartial('libraries', {
      users: { findUserScopesForResourceIndicator },
    });

    const provider = createProvider(tenant);

    const result1 = await getResourceServerInfo(
      createContext(provider, { grantType: GrantType.TokenExchange, organizationId: 'org_1' }),
      indicator
    );
    const result2 = await getResourceServerInfo(
      createContext(provider, { grantType: GrantType.TokenExchange, organizationId: 'org_2' }),
      indicator
    );

    expect(result1.scope).toBe('read:api');
    expect(result2.scope).toBe('write:api');
    expect(findResourceByIndicator).toHaveBeenCalledTimes(2);
    expect(findUserScopesForResourceIndicator).toHaveBeenCalledTimes(2);
  });

  it('should translate application access denial to an OIDC access denied error when loading existing grant', async () => {
    const assertUserHasApplicationAccess = jest
      .fn()
      .mockRejectedValueOnce(new RequestError('oidc.access_denied'));
    const tenant = new MockTenant();

    tenant.setPartial('libraries', {
      applicationAccessControl: { assertUserHasApplicationAccess },
    });

    const provider = createProvider(tenant);
    const configuration = getProviderConfiguration(provider);
    const ctx = createOidcContext({
      provider,
      account: { accountId },
      client: createTestClient(),
      result: { consent: { grantId: 'grant_id' } },
    } as Partial<KoaContextWithOIDC['oidc']>);

    await expect(configuration.loadExistingGrant(ctx)).rejects.toThrow(errors.AccessDenied);
    expect(assertUserHasApplicationAccess).toHaveBeenCalledWith(clientId, accountId, true);
  });

  it('should check application access for consent prompt without existing marker when loading existing grant', async () => {
    const assertUserHasApplicationAccess = jest.fn();
    const tenant = new MockTenant();

    tenant.setPartial('libraries', {
      applicationAccessControl: { assertUserHasApplicationAccess },
    });

    const provider = createProvider(tenant);
    const findGrant = mockGrantFound(provider);
    const configuration = getProviderConfiguration(provider);
    const ctx = createOidcContext({
      provider,
      account: { accountId, claims: async () => ({ sub: accountId }) },
      client: createTestClient(),
      prompts: new Set(['consent']),
      result: { consent: { grantId: 'grant_id' } },
    } as Partial<KoaContextWithOIDC['oidc']>);

    await expect(configuration.loadExistingGrant(ctx)).resolves.toBeDefined();
    expect(assertUserHasApplicationAccess).toHaveBeenCalledWith(clientId, accountId, true);
    expect(findGrant).toHaveBeenCalledWith('grant_id');
  });

  it('should skip duplicated application access check when loading existing grant', async () => {
    const assertUserHasApplicationAccess = jest.fn();
    const tenant = new MockTenant();

    tenant.setPartial('libraries', {
      applicationAccessControl: { assertUserHasApplicationAccess },
    });

    const provider = createProvider(tenant);
    const findGrant = mockGrantFound(provider);
    const configuration = getProviderConfiguration(provider);
    const ctx = createOidcContext({
      provider,
      account: { accountId, claims: async () => ({ sub: accountId }) },
      client: createTestClient(),
      result: markAppLevelAccessControlChecked(
        { consent: { grantId: 'grant_id' } },
        clientId,
        accountId
      ),
    } as Partial<KoaContextWithOIDC['oidc']>);

    await expect(configuration.loadExistingGrant(ctx)).resolves.toBeDefined();
    expect(assertUserHasApplicationAccess).not.toHaveBeenCalled();
    expect(findGrant).toHaveBeenCalledWith('grant_id');
  });

  it('should mark application access as checked after loading existing grant', async () => {
    const assertUserHasApplicationAccess = jest.fn();
    const tenant = new MockTenant();

    tenant.setPartial('libraries', {
      applicationAccessControl: { assertUserHasApplicationAccess },
    });

    const provider = createProvider(tenant);
    const findGrant = mockGrantFound(provider);
    const configuration = getProviderConfiguration(provider);
    const ctx = createOidcContext({
      provider,
      account: { accountId, claims: async () => ({ sub: accountId }) },
      client: createTestClient(),
      result: { consent: { grantId: 'grant_id' } },
    } as Partial<KoaContextWithOIDC['oidc']>);

    await expect(configuration.loadExistingGrant(ctx)).resolves.toBeDefined();
    expect(assertUserHasApplicationAccess).toHaveBeenCalledWith(clientId, accountId, true);
    expect(hasAppLevelAccessControlChecked(ctx.oidc.result, clientId, accountId)).toBe(true);
    expect(findGrant).toHaveBeenCalledWith('grant_id');
  });

  it('should reuse the session grant for registered clients', async () => {
    const assertUserHasApplicationAccess = jest.fn();
    const tenant = new MockTenant();

    tenant.setPartial('libraries', {
      applicationAccessControl: { assertUserHasApplicationAccess },
    });

    const provider = createProvider(tenant);
    const findGrant = mockGrantFound(provider);
    const configuration = getProviderConfiguration(provider);
    const grantIdFor = jest.fn().mockReturnValue('session_grant_id');
    const ctx = createOidcContext({
      provider,
      account: { accountId, claims: async () => ({ sub: accountId }) },
      client: createTestClient(),
      session: { grantIdFor },
    } as unknown as Partial<KoaContextWithOIDC['oidc']>);

    await expect(configuration.loadExistingGrant(ctx)).resolves.toBeDefined();
    expect(grantIdFor).toHaveBeenCalledWith(clientId);
    expect(findGrant).toHaveBeenCalledWith('session_grant_id');
  });

  it('should defer application access check to consent prompt when no existing grant is loaded', async () => {
    const assertUserHasApplicationAccess = jest
      .fn()
      .mockRejectedValueOnce(new RequestError('oidc.access_denied'));
    const tenant = new MockTenant();

    tenant.setPartial('libraries', {
      applicationAccessControl: { assertUserHasApplicationAccess },
    });

    const provider = createProvider(tenant);
    const configuration = getProviderConfiguration(provider);
    const ctx = createOidcContext({
      provider,
      account: { accountId },
      client: { clientId },
    } as Partial<KoaContextWithOIDC['oidc']>);

    await expect(configuration.loadExistingGrant(ctx)).resolves.toBeUndefined();
    expect(assertUserHasApplicationAccess).not.toHaveBeenCalled();
  });

  it('should reflect updated resource data outside token exchange read path', async () => {
    const findResourceByIndicator = jest
      .fn()
      .mockResolvedValueOnce({
        ...mockResource,
        indicator,
        accessTokenTtl: 3600,
      })
      .mockResolvedValueOnce({
        ...mockResource,
        indicator,
        accessTokenTtl: 7200,
      });
    const findApplicationById = jest.fn().mockResolvedValue({ isThirdParty: false });
    const findUserScopesForResourceIndicator = jest
      .fn()
      .mockResolvedValue([buildScope('scope_1', 'read:api')]);
    const tenant = new MockTenant(undefined, {
      resources: { findResourceByIndicator },
      applications: { findApplicationById },
    });

    tenant.setPartial('libraries', {
      users: { findUserScopesForResourceIndicator },
    });

    const provider = createProvider(tenant);
    const ctx = createContext(provider, {
      grantType: GrantType.RefreshToken,
      organizationId: 'org_1',
    });

    const result1 = await getResourceServerInfo(ctx, indicator);
    const result2 = await getResourceServerInfo(ctx, indicator);

    expect(result1.accessTokenTTL).toBe(3600);
    expect(result2.accessTokenTTL).toBe(7200);
    expect(findResourceByIndicator).toHaveBeenCalledTimes(2);
    expect(findApplicationById).toHaveBeenCalledTimes(2);
    expect(findUserScopesForResourceIndicator).toHaveBeenCalledTimes(2);
  });
});

describe('getResourceServerInfo for CIMD clients', () => {
  const cimdClientId = 'https://client.example.com/client-metadata.json';

  const createCimdContext = (provider: KoaContextWithOIDC['oidc']['provider']) =>
    createContext(provider, { grantType: GrantType.AuthorizationCode, clientId: cimdClientId });

  it('should filter resource scopes through the tenant ceiling without touching the applications table', async () => {
    const findResourceByIndicator = jest.fn().mockResolvedValue({
      ...mockResource,
      indicator,
      accessTokenTtl: 3600,
    });
    const findApplicationById = jest.fn();
    const findUserScopesForResourceIndicator = jest
      .fn()
      .mockResolvedValue([
        buildScope('scope_1', 'read:api'),
        buildScope('scope_2', 'write:api'),
        buildScope('scope_3', 'read:organization-api'),
      ]);
    const tenant = new MockTenant(undefined, {
      resources: { findResourceByIndicator },
      applications: { findApplicationById },
      cimd: {
        resourceScopes: {
          insert: jest.fn(),
          findAll: jest.fn().mockResolvedValue([buildScope('scope_1', 'read:api')]),
          delete: jest.fn(),
        },
        organizationResourceScopes: {
          insert: jest.fn(),
          findAll: jest.fn().mockResolvedValue([buildScope('scope_3', 'read:organization-api')]),
          delete: jest.fn(),
        },
      },
    });

    tenant.setPartial('libraries', {
      users: { findUserScopesForResourceIndicator },
    });

    const { id, queries, libraries, logtoConfigs, subscription } = tenant;
    const provider = initOidc(id, cimdEnvSet, queries, libraries, logtoConfigs, subscription);
    const ctx = createCimdContext(provider);

    const result = await getResourceServerInfo(ctx, indicator);

    expect(result.scope).toBe('read:api read:organization-api');
    expect(findApplicationById).not.toHaveBeenCalled();
  });

  it('should treat the identifier url as third-party without a database lookup when CIMD is not effectively enabled', async () => {
    const findResourceByIndicator = jest.fn().mockResolvedValue({
      ...mockResource,
      indicator,
      accessTokenTtl: 3600,
    });
    const findApplicationById = jest.fn();
    const findUserScopesForResourceIndicator = jest
      .fn()
      .mockResolvedValue([buildScope('scope_1', 'read:api'), buildScope('scope_2', 'write:api')]);
    const getApplicationUserConsentResourceScopes = jest
      .fn()
      .mockResolvedValue([
        { resource: { indicator }, scopes: [buildScope('scope_1', 'read:api')] },
      ]);
    const getApplicationUserConsentOrganizationResourceScopes = jest.fn().mockResolvedValue([]);
    const tenant = new MockTenant(undefined, {
      resources: { findResourceByIndicator },
      applications: { findApplicationById },
    });

    tenant.setPartial('libraries', {
      users: { findUserScopesForResourceIndicator },
      applications: {
        getApplicationUserConsentResourceScopes,
        getApplicationUserConsentOrganizationResourceScopes,
      },
    });

    const provider = createProvider(tenant);
    const ctx = createCimdContext(provider);

    const result = await getResourceServerInfo(ctx, indicator);

    expect(result.scope).toBe('read:api');
    expect(findApplicationById).not.toHaveBeenCalled();
  });
});

const runInteractionUrl = (provider: ReturnType<typeof createProvider>, promptClientId: string) => {
  const configuration = getProviderConfiguration(provider);
  const ctx = createOidcContext({ provider });
  const interaction = {
    params: { client_id: promptClientId },
    prompt: { name: 'consent', reasons: [], details: {} },
  } as unknown as Parameters<typeof configuration.interactions.url>[1];

  return { ctx, url: configuration.interactions.url(ctx, interaction) };
};

describe('experience cookie for CIMD prompts', () => {
  const cimdClientId = 'https://client.example.com/client-metadata.json';

  it('should omit appId from the experience cookie for a cimd prompt', async () => {
    const { id, queries, libraries, logtoConfigs, subscription } = new MockTenant();
    const provider = initOidc(id, cimdEnvSet, queries, libraries, logtoConfigs, subscription);

    const { ctx } = runInteractionUrl(provider, cimdClientId);

    expect(ctx.cookies.set).toHaveBeenCalledWith(
      logtoCookieKey,
      JSON.stringify({}),
      expect.anything()
    );
  });

  it('should keep appId in the experience cookie for a registered client prompt', async () => {
    const provider = createProvider(new MockTenant());

    const { ctx } = runInteractionUrl(provider, clientId);

    expect(ctx.cookies.set).toHaveBeenCalledWith(
      logtoCookieKey,
      JSON.stringify({ appId: clientId }),
      expect.anything()
    );
  });

  it('should keep appId in the experience cookie for a url client id when CIMD is not effectively enabled', async () => {
    const provider = createProvider(new MockTenant());

    const { ctx } = runInteractionUrl(provider, cimdClientId);

    expect(ctx.cookies.set).toHaveBeenCalledWith(
      logtoCookieKey,
      JSON.stringify({ appId: cimdClientId }),
      expect.anything()
    );
  });
});

describe('loadExistingGrant for CIMD clients', () => {
  const cimdClientId = 'https://client.example.com/client-metadata.json';

  const createCimdTestClient = (): KoaContextWithOIDC['oidc']['client'] => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- minimal client stub for OIDC context testing
    return {
      clientId: cimdClientId,
      metadata: () => ({}),
    } as KoaContextWithOIDC['oidc']['client'];
  };

  it('should load the grant without the application access check', async () => {
    const assertUserHasApplicationAccess = jest.fn();
    const tenant = new MockTenant();

    tenant.setPartial('libraries', {
      applicationAccessControl: { assertUserHasApplicationAccess },
    });

    const { id, queries, libraries, logtoConfigs, subscription } = tenant;
    const provider = initOidc(id, cimdEnvSet, queries, libraries, logtoConfigs, subscription);
    const findGrant = mockGrantFound(provider);
    const configuration = getProviderConfiguration(provider);
    const ctx = createOidcContext({
      provider,
      account: { accountId, claims: async () => ({ sub: accountId }) },
      client: createCimdTestClient(),
      result: { consent: { grantId: 'grant_id' } },
    } as Partial<KoaContextWithOIDC['oidc']>);

    await expect(configuration.loadExistingGrant(ctx)).resolves.toBeDefined();
    expect(assertUserHasApplicationAccess).not.toHaveBeenCalled();
    expect(findGrant).toHaveBeenCalledWith('grant_id');
  });

  it('should skip the session grant reuse so each authorization gets a fresh grant', async () => {
    const tenant = new MockTenant();
    const { id, queries, libraries, logtoConfigs, subscription } = tenant;
    const provider = initOidc(id, cimdEnvSet, queries, libraries, logtoConfigs, subscription);
    const findGrant = jest.spyOn(provider.Grant, 'find');
    const configuration = getProviderConfiguration(provider);
    const grantIdFor = jest.fn().mockReturnValue('session_grant_id');
    const ctx = createOidcContext({
      provider,
      account: { accountId, claims: async () => ({ sub: accountId }) },
      client: createCimdTestClient(),
      session: { grantIdFor },
    } as unknown as Partial<KoaContextWithOIDC['oidc']>);

    await expect(configuration.loadExistingGrant(ctx)).resolves.toBeUndefined();
    expect(grantIdFor).not.toHaveBeenCalled();
    expect(findGrant).not.toHaveBeenCalled();
  });

  it('should keep the application access check for a url client id when CIMD is not effectively enabled', async () => {
    const assertUserHasApplicationAccess = jest
      .fn()
      .mockRejectedValueOnce(new RequestError('oidc.access_denied'));
    const tenant = new MockTenant();

    tenant.setPartial('libraries', {
      applicationAccessControl: { assertUserHasApplicationAccess },
    });

    const provider = createProvider(tenant);
    const configuration = getProviderConfiguration(provider);
    const ctx = createOidcContext({
      provider,
      account: { accountId },
      client: createCimdTestClient(),
      result: { consent: { grantId: 'grant_id' } },
    } as Partial<KoaContextWithOIDC['oidc']>);

    await expect(configuration.loadExistingGrant(ctx)).rejects.toThrow(errors.AccessDenied);
    expect(assertUserHasApplicationAccess).toHaveBeenCalledWith(cimdClientId, accountId, undefined);
  });
});

const findAccount = async (findUserById: () => Promise<typeof mockUser>) => {
  const provider = createProvider(new MockTenant(undefined, { users: { findUserById } }));
  const configuration = getProviderConfiguration(provider);
  return configuration.findAccount(createOidcContext({ provider }), accountId);
};

describe('findAccount', () => {
  it('should resolve the account for an active user', async () => {
    await expect(findAccount(async () => ({ ...mockUser, id: accountId }))).resolves.toMatchObject({
      accountId,
    });
  });

  it('should reject when the user cannot be found', async () => {
    await expect(
      findAccount(async () => {
        throw new Error('not found');
      })
    ).rejects.toMatchError(new errors.InvalidGrant('user not found'));
  });

  it('should reject when the user is suspended', async () => {
    await expect(
      findAccount(async () => ({ ...mockUser, id: accountId, isSuspended: true }))
    ).rejects.toMatchError(new errors.InvalidGrant('user is suspended'));
  });
});
/* eslint-enable max-lines */
