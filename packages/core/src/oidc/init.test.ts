import assert from 'node:assert';

import { GrantType, type Scope } from '@logto/schemas';
import { errors, type KoaContextWithOIDC } from 'oidc-provider';
import instance from 'oidc-provider/lib/helpers/weak_cache.js';

import { mockResource } from '#src/__mocks__/index.js';
import RequestError from '#src/errors/RequestError/index.js';
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
  it('init should not throw', async () => {
    const { id, queries, libraries, logtoConfigs, subscription } = new MockTenant();

    expect(() =>
      initOidc(id, mockEnvSet, queries, libraries, logtoConfigs, subscription)
    ).not.toThrow();
  });

  it('should allow missing application access control client metadata', async () => {
    const tenant = new MockTenant();
    const provider = createProvider(tenant);
    const configuration = instance(provider).configuration();
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
    const configuration = instance(provider).configuration();
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
    const ctx = createContext(provider, GrantType.TokenExchange, 'org_1');

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
      createContext(provider, GrantType.TokenExchange, 'org_1'),
      indicator
    );
    const result2 = await getResourceServerInfo(
      createContext(provider, GrantType.TokenExchange, 'org_2'),
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
    const configuration = instance(provider).configuration();
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
    const configuration = instance(provider).configuration();
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
    const configuration = instance(provider).configuration();
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
    const configuration = instance(provider).configuration();
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

  it('should defer application access check to consent prompt when no existing grant is loaded', async () => {
    const assertUserHasApplicationAccess = jest
      .fn()
      .mockRejectedValueOnce(new RequestError('oidc.access_denied'));
    const tenant = new MockTenant();

    tenant.setPartial('libraries', {
      applicationAccessControl: { assertUserHasApplicationAccess },
    });

    const provider = createProvider(tenant);
    const configuration = instance(provider).configuration();
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
    const ctx = createContext(provider, GrantType.RefreshToken, 'org_1');

    const result1 = await getResourceServerInfo(ctx, indicator);
    const result2 = await getResourceServerInfo(ctx, indicator);

    expect(result1.accessTokenTTL).toBe(3600);
    expect(result2.accessTokenTTL).toBe(7200);
    expect(findResourceByIndicator).toHaveBeenCalledTimes(2);
    expect(findApplicationById).toHaveBeenCalledTimes(2);
    expect(findUserScopesForResourceIndicator).toHaveBeenCalledTimes(2);
  });
});
