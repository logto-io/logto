import assert from 'node:assert';

import { ReservedResource } from '@logto/core-kit';
import {
  defaultTenantId,
  GrantType,
  type OrganizationScope,
  type ResourceScopeEntity,
  type Scope,
} from '@logto/schemas';
import { errors, type KoaContextWithOIDC } from 'oidc-provider';

import { mockResource } from '#src/__mocks__/index.js';
import { EnvSet } from '#src/env-set/index.js';
import { getProviderConfiguration } from '#src/oidc/oidc-provider-internals.js';
import { mockEnvSet } from '#src/test-utils/env-set.js';
import { createOidcContext } from '#src/test-utils/oidc-provider.js';
import { MockTenant } from '#src/test-utils/tenant.js';

import initOidc from './init.js';

const { jest } = import.meta;

const indicator = 'https://api.notes.com';
const registeredClientId = 'third_party_app_id';
const firstPartyClientId = 'first_party_app_id';
const cimdClientId = 'https://client.example.com/client-metadata.json';
const accountId = 'alice';
const organizationId = 'org_a';

class MockCimdEnvSet extends EnvSet {
  override get oidc(): EnvSet['oidc'] {
    return { ...mockEnvSet.oidc, cimdEnabled: true };
  }
}

const cimdEnvSet = new MockCimdEnvSet(defaultTenantId, EnvSet.values.dbUrl);

const buildScope = (id: string, name: string): Scope => ({
  tenantId: 'default',
  id,
  resourceId: 'resource_1',
  name,
  description: null,
  createdAt: 0,
});

const buildResourceScope = (id: string, name: string): ResourceScopeEntity => ({
  id,
  name,
  resource: {
    id: 'resource_1',
    name: 'Notes API',
  },
});

const buildOrgScope = (id: string, name: string): OrganizationScope => ({
  tenantId: 'default',
  id,
  name,
  description: null,
});

const personalScope = buildScope('scope_personal', 'global:billing');
const orgApiScope = buildScope('scope_org_api', 'org:doc');
const orgScope = buildOrgScope('org_scope_1', 'invite:member');

const getResourceServerInfo = async (ctx: KoaContextWithOIDC, resourceIndicator: string) => {
  const configuration = getProviderConfiguration(ctx.oidc.provider);
  assert(ctx.oidc.client);
  return configuration.features.resourceIndicators.getResourceServerInfo(
    ctx,
    resourceIndicator,
    ctx.oidc.client
  );
};

const createContext = (
  provider: KoaContextWithOIDC['oidc']['provider'],
  {
    clientId,
    route,
    organizationId: orgId,
    withAccount = true,
  }: {
    clientId: string;
    route?: string;
    organizationId?: string;
    withAccount?: boolean;
  }
) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- minimal client stub for OIDC context testing
  const client = { clientId } as KoaContextWithOIDC['oidc']['client'];
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- minimal account stub for OIDC context testing
  const account = {
    accountId,
    claims: async () => ({ sub: accountId }),
  } as KoaContextWithOIDC['oidc']['entities']['Account'];

  return createOidcContext({
    provider,
    route: route ?? '',
    client,
    params: {
      grant_type: GrantType.RefreshToken,
      ...(orgId ? { organization_id: orgId } : {}),
    },
    entities: withAccount ? { Account: account } : {},
  });
};

const createIsolatedTenant = ({ isThirdParty }: { isThirdParty: boolean }) => {
  const findResourceByIndicator = jest.fn(async (target: string) =>
    target === indicator ? { ...mockResource, indicator, accessTokenTtl: 3600 } : null
  );
  const findApplicationById = jest.fn().mockResolvedValue({ isThirdParty });
  const findAllOrgScopes = jest.fn().mockResolvedValue([1, [orgScope]]);
  const findUserScopesForResourceIndicator = jest.fn(
    async (_userId: string, _indicator: string, findFromOrganizations?: boolean) =>
      findFromOrganizations ? [personalScope, orgApiScope] : [personalScope]
  );
  const getUserResourceScopes = jest
    .fn()
    .mockResolvedValue([buildResourceScope(orgApiScope.id, orgApiScope.name)]);
  const getApplicationUserConsentResourceScopes = jest
    .fn()
    .mockResolvedValue([{ resource: { indicator }, scopes: [personalScope] }]);
  const getApplicationUserConsentOrganizationResourceScopes = jest
    .fn()
    .mockResolvedValue([{ resource: { indicator }, scopes: [orgApiScope] }]);
  const getApplicationUserConsentOrganizationScopes = jest.fn().mockResolvedValue([orgScope]);

  const tenant = new MockTenant(
    undefined,
    {
      resources: { findResourceByIndicator },
      applications: { findApplicationById },
      cimd: {
        resourceScopes: {
          insert: jest.fn(),
          findAll: jest.fn().mockResolvedValue([personalScope]),
          delete: jest.fn(),
        },
        organizationResourceScopes: {
          insert: jest.fn(),
          findAll: jest.fn().mockResolvedValue([orgApiScope]),
          delete: jest.fn(),
        },
        organizationScopes: {
          insert: jest.fn(),
          findAll: jest.fn().mockResolvedValue([orgScope]),
          delete: jest.fn(),
        },
      },
    },
    undefined,
    {
      users: { findUserScopesForResourceIndicator },
      applications: {
        getApplicationUserConsentResourceScopes,
        getApplicationUserConsentOrganizationResourceScopes,
        getApplicationUserConsentOrganizationScopes,
      },
    }
  );

  jest.spyOn(tenant.queries.organizations.scopes, 'findAll').mockImplementation(findAllOrgScopes);
  jest
    .spyOn(tenant.queries.organizations.relations.usersRoles, 'getUserResourceScopes')
    .mockImplementation(getUserResourceScopes);

  return {
    tenant,
    findApplicationById,
    findAllOrgScopes,
    findUserScopesForResourceIndicator,
    getUserResourceScopes,
  };
};

describe('getResourceServerInfo token-route context isolation', () => {
  describe.each([
    { label: 'registered third-party app', clientId: registeredClientId, isCimd: false },
    { label: 'CIMD client', clientId: cimdClientId, isCimd: true },
  ])('$label', ({ clientId, isCimd }) => {
    const setup = () => {
      const mocks = createIsolatedTenant({ isThirdParty: true });
      const { id, queries, libraries, logtoConfigs, subscription } = mocks.tenant;
      const provider = initOidc(
        id,
        isCimd ? cimdEnvSet : mocks.tenant.envSet,
        queries,
        libraries,
        logtoConfigs,
        subscription
      );
      return { ...mocks, provider };
    };

    it('Case 1: isolates personal API scopes on token route (omits org roles & org config)', async () => {
      const { provider, findApplicationById, findUserScopesForResourceIndicator } = setup();
      const ctx = createContext(provider, { clientId, route: 'token' });

      const result = await getResourceServerInfo(ctx, indicator);

      expect(result.scope).toBe('global:billing');
      expect(findUserScopesForResourceIndicator).toHaveBeenCalledWith(accountId, indicator, false);
      if (isCimd) {
        expect(findApplicationById).not.toHaveBeenCalled();
      }
    });

    it('Case 2: isolates org API scopes on token route (omits personal global roles & personal config)', async () => {
      const {
        provider,
        findApplicationById,
        findUserScopesForResourceIndicator,
        getUserResourceScopes,
      } = setup();
      const ctx = createContext(provider, { clientId, route: 'token', organizationId });

      const result = await getResourceServerInfo(ctx, indicator);

      expect(result.scope).toBe('org:doc');
      expect(getUserResourceScopes).toHaveBeenCalledWith(accountId, indicator, organizationId);
      expect(findUserScopesForResourceIndicator).not.toHaveBeenCalled();
      if (isCimd) {
        expect(findApplicationById).not.toHaveBeenCalled();
      }
    });

    it.each([undefined, organizationId])(
      'Case 4: returns empty scope for ReservedResource.Organization on token route (organizationId=%s)',
      async (orgId) => {
        const { provider, findApplicationById, findAllOrgScopes } = setup();
        const ctx = createContext(provider, { clientId, route: 'token', organizationId: orgId });

        const result = await getResourceServerInfo(ctx, ReservedResource.Organization);

        expect(result.scope).toBe('');
        expect(findAllOrgScopes).not.toHaveBeenCalled();
        if (isCimd) {
          expect(findApplicationById).not.toHaveBeenCalled();
        }
      }
    );

    it.each(['authorization', 'resume', 'code_verification', 'device_resume'])(
      'keeps combined consent-stage candidate scopes on %s route',
      async (route) => {
        const { provider } = setup();
        const ctx = createContext(provider, { clientId, route });

        const apiResult = await getResourceServerInfo(ctx, indicator);
        const orgResult = await getResourceServerInfo(ctx, ReservedResource.Organization);

        expect(apiResult.scope).toBe('global:billing org:doc');
        expect(orgResult.scope).toBe('invite:member');
      }
    );

    it.each(['pushed_authorization_request', 'device_authorization'])(
      'safely falls into isolated mode on %s without throwing for valid resources',
      async (route) => {
        const { provider } = setup();
        const ctx = createContext(provider, { clientId, route, withAccount: false });

        const apiResult = await getResourceServerInfo(ctx, indicator);
        const orgResult = await getResourceServerInfo(ctx, ReservedResource.Organization);

        expect(apiResult.scope).toBe('');
        expect(orgResult.scope).toBe('');
        await expect(getResourceServerInfo(ctx, 'https://unknown.example.com')).rejects.toThrow(
          errors.InvalidTarget
        );
      }
    );

    it('fails closed into isolated mode when route is missing or unrecognized', async () => {
      const { provider } = setup();

      const emptyRouteResult = await getResourceServerInfo(
        createContext(provider, { clientId, route: '' }),
        indicator
      );
      const unknownRouteResult = await getResourceServerInfo(
        createContext(provider, { clientId, route: 'unexpected_route' }),
        indicator
      );

      expect(emptyRouteResult.scope).toBe('global:billing');
      expect(unknownRouteResult.scope).toBe('global:billing');
    });
  });

  it('keeps first-party application behavior unchanged on token route', async () => {
    const { tenant, findUserScopesForResourceIndicator, findAllOrgScopes } = createIsolatedTenant({
      isThirdParty: false,
    });
    const provider = initOidc(
      tenant.id,
      tenant.envSet,
      tenant.queries,
      tenant.libraries,
      tenant.logtoConfigs,
      tenant.subscription
    );

    const apiResult = await getResourceServerInfo(
      createContext(provider, { clientId: firstPartyClientId, route: 'token' }),
      indicator
    );
    const orgResult = await getResourceServerInfo(
      createContext(provider, { clientId: firstPartyClientId, route: 'token' }),
      ReservedResource.Organization
    );

    expect(apiResult.scope).toBe('global:billing org:doc');
    expect(findUserScopesForResourceIndicator).toHaveBeenCalledWith(
      accountId,
      indicator,
      true,
      undefined
    );
    expect(orgResult.scope).toBe('invite:member');
    expect(findAllOrgScopes).toHaveBeenCalledTimes(1);
  });
});
