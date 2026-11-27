import { ReservedResource, UserScope } from '@logto/core-kit';
import {
  defaultTenantId,
  GrantType,
  type OrganizationScope,
  type ResourceScopeEntity,
  type Scope,
} from '@logto/schemas';
import { assert } from '@silverhand/essentials';
import { errors, type KoaContextWithOIDC } from 'oidc-provider';

import { mockResource } from '#src/__mocks__/index.js';
import { EnvSet } from '#src/env-set/index.js';
import { getProviderConfiguration } from '#src/oidc/oidc-provider-internals.js';
import { mockEnvSet } from '#src/test-utils/env-set.js';
import { createOidcContext } from '#src/test-utils/oidc-provider.js';
import { MockTenant } from '#src/test-utils/tenant.js';

import initOidc, { consentAuthorizationRoutes } from './init.js';

const { jest } = import.meta;

const indicator = 'https://api.notes.com';
const registeredClientId = 'third_party_app_id';
const firstPartyClientId = 'first_party_app_id';
const cimdClientId = 'https://client.example.com/client-metadata.json';
const accountId = 'alice';
const organizationId = 'org_a';
const otherOrganizationId = 'org_b';

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
  resource: { id: 'resource_1', name: 'Notes API' },
});

const mockCimdTable = <T>(rows: T[]) => ({
  insert: jest.fn(),
  findAll: jest.fn().mockResolvedValue(rows),
  delete: jest.fn(),
});

const personalScope = buildScope('scope_personal', 'global:billing');
const globalOnlyOrgCfgScope = buildScope('scope_global_only', 'global:only');
const orgOnlyPersonalCfgScope = buildScope('scope_org_only', 'org:only');
const orgApiScope = buildScope('scope_org_api', 'org:doc');
const orgBApiScope = buildScope('scope_org_b_api', 'org:doc_b');
const orgScope: OrganizationScope = {
  tenantId: 'default',
  id: 'org_scope_1',
  name: 'invite:member',
  description: null,
};

const createProvider = (tenant: MockTenant, isCimd = false) =>
  initOidc(
    tenant.id,
    isCimd ? cimdEnvSet : tenant.envSet,
    tenant.queries,
    tenant.libraries,
    tenant.logtoConfigs,
    tenant.subscription
  );

const getResourceServerInfo = async (ctx: KoaContextWithOIDC, resourceIndicator: string) => {
  const configuration = getProviderConfiguration(ctx.oidc.provider);
  assert(ctx.oidc.client, new Error('client is required'));
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
    hasConsentResult = false,
    sessionGrantId,
  }: {
    clientId: string;
    route?: string;
    organizationId?: string;
    withAccount?: boolean;
    hasConsentResult?: boolean;
    sessionGrantId?: string;
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
    ...(hasConsentResult ? { result: { consent: { grantId: 'grant_1' } } } : {}),
    ...(sessionGrantId
      ? {
          session: {
            accountId,
            grantIdFor: () => sessionGrantId,
          } as unknown as KoaContextWithOIDC['oidc']['session'],
        }
      : {}),
  });
};

const resolveScope = async (
  provider: KoaContextWithOIDC['oidc']['provider'],
  options: Parameters<typeof createContext>[1],
  resourceIndicator = indicator
) => {
  const { scope } = await getResourceServerInfo(
    createContext(provider, options),
    resourceIndicator
  );
  return scope;
};

const createIsolatedTenant = ({ isThirdParty }: { isThirdParty: boolean }) => {
  const findResourceByIndicator = jest.fn(async (target: string) =>
    target === indicator ? { ...mockResource, indicator, accessTokenTtl: 3600 } : null
  );
  const findApplicationById = jest.fn().mockResolvedValue({ isThirdParty });
  const findAllOrgScopes = jest.fn().mockResolvedValue([1, [orgScope]]);
  const globalRoles = [personalScope, globalOnlyOrgCfgScope];
  const orgARoles = [
    buildResourceScope(orgApiScope.id, orgApiScope.name),
    buildResourceScope(orgOnlyPersonalCfgScope.id, orgOnlyPersonalCfgScope.name),
  ];
  const orgBRoles = [buildResourceScope(orgBApiScope.id, orgBApiScope.name)];
  const personalConfig = [personalScope, orgOnlyPersonalCfgScope];
  const orgConfig = [orgApiScope, orgBApiScope, globalOnlyOrgCfgScope];

  const findUserScopesForResourceIndicator = jest.fn(
    async (_userId: string, _indicator: string, findFromOrganizations?: boolean) =>
      findFromOrganizations ? [personalScope, orgApiScope] : globalRoles
  );
  const getUserResourceScopes = jest.fn(
    async (_userId: string, _indicator: string, orgId?: string | readonly string[]) => {
      if (orgId === undefined) {
        return [...orgARoles, ...orgBRoles];
      }

      const ids = Array.isArray(orgId) ? orgId : [orgId];
      return [
        ...(ids.includes(organizationId) ? orgARoles : []),
        ...(ids.includes(otherOrganizationId) ? orgBRoles : []),
      ];
    }
  );
  const findOrganizationIds = jest.fn(async (): Promise<readonly string[]> => [organizationId]);
  const getApplicationUserConsentResourceScopes = jest
    .fn()
    .mockResolvedValue([{ resource: { indicator }, scopes: personalConfig }]);
  const getApplicationUserConsentOrganizationResourceScopes = jest
    .fn()
    .mockResolvedValue([{ resource: { indicator }, scopes: orgConfig }]);
  const getApplicationUserConsentOrganizationScopes = jest.fn().mockResolvedValue([orgScope]);

  const tenant = new MockTenant(
    undefined,
    {
      resources: { findResourceByIndicator },
      applications: { findApplicationById },
      cimd: {
        resourceScopes: mockCimdTable(personalConfig),
        organizationResourceScopes: mockCimdTable(orgConfig),
        organizationScopes: mockCimdTable([orgScope]),
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
  jest
    .spyOn(tenant.queries.applications.userConsentOrganizations, 'findOrganizationIds')
    .mockImplementation(findOrganizationIds);

  return {
    tenant,
    findApplicationById,
    findAllOrgScopes,
    findUserScopesForResourceIndicator,
    getUserResourceScopes,
    findOrganizationIds,
    getApplicationUserConsentResourceScopes,
    getApplicationUserConsentOrganizationResourceScopes,
  };
};

describe('getResourceServerInfo token-route context isolation', () => {
  it('pins the four consent/authorization route names against the provider router', () => {
    const provider = createProvider(new MockTenant());
    // `Provider#pathFor` is a runtime method on oidc-provider missing from `@types/oidc-provider`.
    const pathFor: unknown = Reflect.get(provider, 'pathFor');
    expect(typeof pathFor).toBe('function');

    expect([...consentAuthorizationRoutes].slice().sort()).toEqual([
      'authorization',
      'code_verification',
      'device_resume',
      'resume',
    ]);

    for (const route of consentAuthorizationRoutes) {
      expect(() =>
        (pathFor as (name: string, options?: Record<string, string>) => string).call(
          provider,
          route,
          { uid: 'uid' }
        )
      ).not.toThrow();
    }
  });

  describe.each([
    { label: 'registered third-party app', clientId: registeredClientId, isCimd: false },
    { label: 'CIMD client', clientId: cimdClientId, isCimd: true },
  ])('$label', ({ clientId, isCimd }) => {
    const setup = () => {
      const mocks = createIsolatedTenant({ isThirdParty: true });
      const provider = createProvider(mocks.tenant, isCimd);
      const resolve = async (
        options: Omit<Parameters<typeof createContext>[1], 'clientId'>,
        resourceIndicator = indicator
      ) => resolveScope(provider, { clientId, ...options }, resourceIndicator);
      return { ...mocks, provider, resolve };
    };

    it('Case 1: isolates personal API scopes on token route (omits org roles & org config)', async () => {
      const {
        resolve,
        tenant,
        findApplicationById,
        findUserScopesForResourceIndicator,
        getUserResourceScopes,
        getApplicationUserConsentOrganizationResourceScopes,
      } = setup();
      expect(await resolve({ route: 'token' })).toBe('global:billing');
      expect(findUserScopesForResourceIndicator).toHaveBeenCalledWith(accountId, indicator);
      expect(getUserResourceScopes).not.toHaveBeenCalled();
      if (isCimd) {
        expect(findApplicationById).not.toHaveBeenCalled();
        expect(tenant.queries.cimd.organizationResourceScopes.findAll).not.toHaveBeenCalled();
      } else {
        expect(getApplicationUserConsentOrganizationResourceScopes).not.toHaveBeenCalled();
      }
    });

    it('Case 2: isolates org API scopes on token route (omits personal global roles & personal config)', async () => {
      const {
        resolve,
        tenant,
        findApplicationById,
        findUserScopesForResourceIndicator,
        getUserResourceScopes,
        getApplicationUserConsentResourceScopes,
      } = setup();

      expect(await resolve({ route: 'token', organizationId })).toBe('org:doc');
      expect(getUserResourceScopes).toHaveBeenCalledWith(accountId, indicator, organizationId);
      expect(findUserScopesForResourceIndicator).not.toHaveBeenCalled();
      if (isCimd) {
        expect(findApplicationById).not.toHaveBeenCalled();
        expect(tenant.queries.cimd.resourceScopes.findAll).not.toHaveBeenCalled();
      } else {
        expect(getApplicationUserConsentResourceScopes).not.toHaveBeenCalled();
      }
    });

    it.each([undefined, organizationId])(
      'Case 4: returns empty scope for ReservedResource.Organization on token route (organizationId=%s)',
      async (orgId) => {
        const { resolve, findApplicationById, findAllOrgScopes } = setup();

        expect(
          await resolve({ route: 'token', organizationId: orgId }, ReservedResource.Organization)
        ).toBe('');
        expect(findAllOrgScopes).not.toHaveBeenCalled();
        if (isCimd) {
          expect(findApplicationById).not.toHaveBeenCalled();
        }
      }
    );

    it('computes consent-stage per-context union without cross-multiplying (with and without organization_id)', async () => {
      const { resolve, findUserScopesForResourceIndicator, getUserResourceScopes } = setup();

      // `global:only` and `org:only` are excluded (no cross-multiplication).
      expect(await resolve({ route: 'authorization' })).toBe('global:billing org:doc org:doc_b');
      expect(await resolve({ route: 'authorization', organizationId })).toBe(
        'global:billing org:doc'
      );
      expect(await resolve({ route: 'authorization', withAccount: false })).toBe('');
      expect(await resolve({ route: 'authorization' }, ReservedResource.Organization)).toBe(
        'invite:member'
      );
      expect(findUserScopesForResourceIndicator).toHaveBeenCalledWith(accountId, indicator);
      expect(getUserResourceScopes).toHaveBeenCalledWith(accountId, indicator, undefined);
      expect(getUserResourceScopes).toHaveBeenCalledWith(accountId, indicator, organizationId);
    });

    it('narrows org roles to consented orgs on post-consent resume and repeat org-scoped auth (registered only)', async () => {
      const { provider, resolve, findOrganizationIds, getUserResourceScopes } = setup();
      findOrganizationIds.mockResolvedValue([organizationId]);
      const mockGrantScope = (scope: string) =>
        jest.spyOn(provider.Grant, 'find').mockResolvedValueOnce({
          getOIDCScope: () => scope,
        } as Awaited<ReturnType<typeof provider.Grant.find>>);

      const resumeScope = await resolve({ route: 'resume', hasConsentResult: true });

      mockGrantScope(`openid ${UserScope.Organizations}`);
      findOrganizationIds.mockResolvedValueOnce([]);
      const repeatOrgAuthScope = await resolve({
        route: 'authorization',
        sessionGrantId: 'grant_1',
      });

      // Existing Grant lacking `UserScope.Organizations` must still query all orgs for the org picker.
      mockGrantScope('openid profile');
      const personalGrantAuthScope = await resolve({
        route: 'authorization',
        sessionGrantId: 'grant_2',
      });

      if (isCimd) {
        expect(findOrganizationIds).not.toHaveBeenCalled();
        expect(resumeScope).toBe('global:billing org:doc org:doc_b');
        expect(repeatOrgAuthScope).toBe('global:billing org:doc org:doc_b');
      } else {
        expect(findOrganizationIds).toHaveBeenCalledTimes(2);
        expect(getUserResourceScopes).toHaveBeenCalledWith(accountId, indicator, [organizationId]);
        expect(resumeScope).toBe('global:billing org:doc');
        expect(repeatOrgAuthScope).toBe('global:billing');
      }
      expect(personalGrantAuthScope).toBe('global:billing org:doc org:doc_b');
    });

    it.each(['pushed_authorization_request', 'device_authorization'])(
      'safely falls into isolated mode on %s without throwing for valid resources',
      async (route) => {
        const { resolve } = setup();
        const options = { route, withAccount: false };

        expect(await resolve(options)).toBe('');
        expect(await resolve(options, ReservedResource.Organization)).toBe('');
        await expect(resolve(options, 'https://unknown.example.com')).rejects.toThrow(
          errors.InvalidTarget
        );
      }
    );

    it('fails closed into isolated mode when route is missing or unrecognized', async () => {
      const { resolve } = setup();

      expect(await resolve({ route: '' })).toBe('global:billing');
      expect(await resolve({ route: 'unexpected_route' })).toBe('global:billing');
    });
  });

  it('keeps first-party application behavior unchanged on token and authorization routes', async () => {
    const { tenant, findUserScopesForResourceIndicator, findAllOrgScopes } = createIsolatedTenant({
      isThirdParty: false,
    });
    const provider = createProvider(tenant);

    expect(await resolveScope(provider, { clientId: firstPartyClientId, route: 'token' })).toBe(
      'global:billing org:doc'
    );
    expect(
      await resolveScope(provider, {
        clientId: firstPartyClientId,
        route: 'authorization',
        organizationId,
      })
    ).toBe('global:billing org:doc');
    expect(
      await resolveScope(
        provider,
        { clientId: firstPartyClientId, route: 'token' },
        ReservedResource.Organization
      )
    ).toBe('invite:member');
    expect(findUserScopesForResourceIndicator).toHaveBeenCalledWith(
      accountId,
      indicator,
      true,
      undefined
    );
    expect(findUserScopesForResourceIndicator).toHaveBeenCalledWith(
      accountId,
      indicator,
      true,
      organizationId
    );
    expect(findAllOrgScopes).toHaveBeenCalledTimes(1);
  });
});
