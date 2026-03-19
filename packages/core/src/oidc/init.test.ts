import assert from 'node:assert';

import { GrantType, type Scope } from '@logto/schemas';
import type { KoaContextWithOIDC } from 'oidc-provider';
import instance from 'oidc-provider/lib/helpers/weak_cache.js';

import { redisCache } from '#src/caches/index.js';
import { mockEnvSet } from '#src/test-utils/env-set.js';
import { createOidcContext } from '#src/test-utils/oidc-provider.js';
import { MockTenant } from '#src/test-utils/tenant.js';

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
  const configuration = instance(ctx.oidc.provider).configuration();
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

const createContext = (
  provider: KoaContextWithOIDC['oidc']['provider'],
  grantType: GrantType,
  organizationId?: string
) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- minimal client stub for OIDC context testing
  const client: KoaContextWithOIDC['oidc']['client'] = {
    clientId,
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
  beforeEach(() => {
    const store = new Map<string, string>();

    jest.spyOn(redisCache, 'get').mockImplementation(async (key) => store.get(key));
    jest.spyOn(redisCache, 'set').mockImplementation(async (key, value) => {
      store.set(key, value);
    });
    jest.spyOn(redisCache, 'delete').mockImplementation(async (key) => {
      store.delete(key);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('init should not throw', async () => {
    const { id, queries, libraries, logtoConfigs, subscription } = new MockTenant();

    expect(() =>
      initOidc(id, mockEnvSet, queries, libraries, logtoConfigs, subscription)
    ).not.toThrow();
  });

  it('should cache resource server info for token exchange read path', async () => {
    const findResourceByIndicator = jest.fn().mockResolvedValue({
      indicator,
      accessTokenTtl: 3600,
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
    const ctx = createContext(provider, GrantType.TokenExchange, 'org_1');

    await getResourceServerInfo(ctx, indicator);
    await getResourceServerInfo(ctx, indicator);

    expect(findResourceByIndicator).toHaveBeenCalledTimes(1);
    expect(findApplicationById).toHaveBeenCalledTimes(1);
    expect(findUserScopesForResourceIndicator).toHaveBeenCalledTimes(1);
  });

  it('should not reuse cached resource server info across organizations', async () => {
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
        findResourceByIndicator: jest.fn().mockResolvedValue({
          indicator,
          accessTokenTtl: 3600,
        }),
      },
      applications: { findApplicationById: jest.fn().mockResolvedValue({ isThirdParty: false }) },
    });

    tenant.setPartial('libraries', {
      users: { findUserScopesForResourceIndicator },
    });

    const provider = createProvider(tenant);

    const result1 = await getResourceServerInfo(
      createContext(provider, GrantType.TokenExchange, 'org_1'),
      indicator
    );
    const result2 = await getResourceServerInfo(
      createContext(provider, GrantType.TokenExchange, 'org_2'),
      indicator
    );

    expect(result1.scope).toBe('read:api');
    expect(result2.scope).toBe('write:api');
    expect(findUserScopesForResourceIndicator).toHaveBeenCalledTimes(2);
  });

  it('should not cache resource server info outside token exchange read path', async () => {
    const findResourceByIndicator = jest.fn().mockResolvedValue({
      indicator,
      accessTokenTtl: 3600,
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
    const ctx = createContext(provider, GrantType.RefreshToken, 'org_1');

    await getResourceServerInfo(ctx, indicator);
    await getResourceServerInfo(ctx, indicator);

    expect(findResourceByIndicator).toHaveBeenCalledTimes(2);
    expect(findApplicationById).toHaveBeenCalledTimes(2);
    expect(findUserScopesForResourceIndicator).toHaveBeenCalledTimes(2);
  });
});
