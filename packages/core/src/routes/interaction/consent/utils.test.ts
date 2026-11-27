import { ReservedResource, ReservedScope, UserScope } from '@logto/core-kit';
import {
  defaultTenantId,
  type OrganizationScope,
  type Resource,
  type ResourceScopeEntity,
  type Scope,
} from '@logto/schemas';
import { errors } from 'oidc-provider';

import { mockResource } from '#src/__mocks__/index.js';
import { EnvSet } from '#src/env-set/index.js';
import type Queries from '#src/tenants/Queries.js';
import { mockEnvSet } from '#src/test-utils/env-set.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';
import { MockTenant } from '#src/test-utils/tenant.js';

import {
  buildResourceScopesToReject,
  filterAndParseMissingResourceScopes,
  findStaleOidcScopes,
  revalidateConsentClient,
} from './utils.js';

const { jest } = import.meta;

describe('findStaleOidcScopes', () => {
  const clientScope = [ReservedScope.OpenId, ReservedScope.OfflineAccess, UserScope.Profile].join(
    ' '
  );

  it('should return nothing when every requested OIDC scope is still allowed', () => {
    expect(
      findStaleOidcScopes({
        clientScope,
        requestedScope: `${ReservedScope.OpenId} ${UserScope.Profile}`,
        missingOIDCScope: [UserScope.Profile],
      })
    ).toEqual([]);
  });

  it('should flag a requested user scope the current client scope no longer allows', () => {
    expect(
      findStaleOidcScopes({
        clientScope,
        requestedScope: `${ReservedScope.OpenId} ${UserScope.Profile} ${UserScope.Email}`,
        missingOIDCScope: [UserScope.Profile],
      })
    ).toEqual([UserScope.Email]);
  });

  it('should flag a snapshot scope even when it no longer derives from the scope parameter', () => {
    expect(
      findStaleOidcScopes({
        clientScope,
        requestedScope: ReservedScope.OpenId,
        missingOIDCScope: [UserScope.Email],
      })
    ).toEqual([UserScope.Email]);
  });

  it('should ignore resource scope names in the scope parameter', () => {
    expect(
      findStaleOidcScopes({
        clientScope,
        requestedScope: `${ReservedScope.OpenId} read:resource`,
        missingOIDCScope: [],
      })
    ).toEqual([]);
  });

  it('should validate the snapshot alone when the scope parameter is not a string', () => {
    expect(
      findStaleOidcScopes({
        clientScope,
        requestedScope: undefined,
        missingOIDCScope: [UserScope.Profile, UserScope.Email],
      })
    ).toEqual([UserScope.Email]);
  });

  it('should deduplicate scopes present in both the request and the snapshot', () => {
    expect(
      findStaleOidcScopes({
        clientScope,
        requestedScope: `${UserScope.Email} ${UserScope.Organizations}`,
        missingOIDCScope: [UserScope.Email, UserScope.Organizations],
      })
    ).toEqual([UserScope.Email, UserScope.Organizations]);
  });
});

describe('buildResourceScopesToReject', () => {
  it('should reject the remainder of a partially granted group', () => {
    expect(
      buildResourceScopesToReject(
        { 'https://api.example.com': ['read', 'write'] },
        { 'https://api.example.com': ['read'] },
        false
      )
    ).toEqual({ 'https://api.example.com': ['write'] });
  });

  it('should reject the whole group for a CIMD consent submitted without an organization', () => {
    // The group's scopes are reachable through organization roles only, so the rebuild grants nothing for it.
    expect(
      buildResourceScopesToReject({ 'https://api.example.com': ['read', 'write'] }, {}, true)
    ).toEqual({ 'https://api.example.com': ['read', 'write'] });
  });

  it('should reject the whole group for a CIMD consent when the selected organization contributes none of the requested scopes', () => {
    expect(
      buildResourceScopesToReject(
        { 'https://api.example.com': ['read'] },
        { 'urn:logto:resource:organizations': ['org:read'] },
        true
      )
    ).toEqual({ 'https://api.example.com': ['read'] });
  });

  it('should leave an ungrantable group unencountered for a registered client', () => {
    expect(buildResourceScopesToReject({ 'https://api.example.com': ['read'] }, {}, false)).toEqual(
      {
        'https://api.example.com': [],
      }
    );
  });
});

describe('revalidateConsentClient', () => {
  const clientScope = [ReservedScope.OpenId, ReservedScope.OfflineAccess, UserScope.Profile].join(
    ' '
  );
  const cimdClientId = 'https://client.example.com/metadata.json';
  const redirectUri = 'https://client.example.com/callback';

  it('should reject a CIMD submission whose redirect uri the current document no longer allows, without consulting the application registry', async () => {
    const findApplicationById = jest.fn().mockRejectedValue(new Error('should not be called'));
    const provider = createMockProvider(undefined, undefined, {
      find: async () => ({ scope: clientScope, redirectUriAllowed: () => false }),
    });

    await expect(
      revalidateConsentClient({
        provider,
        queries: { applications: { findApplicationById } } as unknown as Queries,
        applicationId: cimdClientId,
        treatAsCimdClient: true,
        redirectUri,
        requestedScope: ReservedScope.OpenId,
        missingOIDCScope: [],
      })
    ).rejects.toThrow(errors.InvalidRedirectUri);

    expect(findApplicationById).not.toHaveBeenCalled();
  });

  it('should reject a CIMD submission when the tenant ceiling no longer allows a snapshot scope', async () => {
    const provider = createMockProvider(undefined, undefined, {
      find: async () => ({ scope: clientScope, redirectUriAllowed: () => true }),
    });

    await expect(
      revalidateConsentClient({
        provider,
        queries: { applications: { findApplicationById: jest.fn() } } as unknown as Queries,
        applicationId: cimdClientId,
        treatAsCimdClient: true,
        redirectUri,
        requestedScope: `${ReservedScope.OpenId} ${UserScope.Email}`,
        missingOIDCScope: [UserScope.Email],
      })
    ).rejects.toThrow(errors.InvalidScope);
  });

  it('should pass a CIMD submission whose redirect uri and scopes are still allowed', async () => {
    const provider = createMockProvider(undefined, undefined, {
      find: async () => ({ scope: clientScope, redirectUriAllowed: () => true }),
    });

    await expect(
      revalidateConsentClient({
        provider,
        queries: { applications: { findApplicationById: jest.fn() } } as unknown as Queries,
        applicationId: cimdClientId,
        treatAsCimdClient: true,
        redirectUri,
        requestedScope: `${ReservedScope.OpenId} ${UserScope.Profile}`,
        missingOIDCScope: [UserScope.Profile],
      })
    ).resolves.toBeUndefined();
  });

  it('should skip revalidation for a first-party application', async () => {
    const find = jest.fn();
    const provider = createMockProvider(undefined, undefined, { find });

    await expect(
      revalidateConsentClient({
        provider,
        queries: {
          applications: {
            findApplicationById: jest.fn().mockResolvedValue({ isThirdParty: false }),
          },
        } as unknown as Queries,
        applicationId: 'registered-app-id',
        treatAsCimdClient: false,
        redirectUri,
        requestedScope: ReservedScope.OpenId,
        missingOIDCScope: [],
      })
    ).resolves.toBeUndefined();

    expect(find).not.toHaveBeenCalled();
  });

  it('should reject a third-party application submission when a snapshot scope is no longer allowed', async () => {
    const provider = createMockProvider(undefined, undefined, {
      find: async () => ({ scope: clientScope, redirectUriAllowed: () => true }),
    });

    await expect(
      revalidateConsentClient({
        provider,
        queries: {
          applications: {
            findApplicationById: jest.fn().mockResolvedValue({ isThirdParty: true }),
          },
        } as unknown as Queries,
        applicationId: 'registered-app-id',
        treatAsCimdClient: false,
        redirectUri,
        requestedScope: `${ReservedScope.OpenId} ${UserScope.Email}`,
        missingOIDCScope: [UserScope.Email],
      })
    ).rejects.toThrow(errors.InvalidScope);
  });
});

class MockCimdEnvSet extends EnvSet {
  override get oidc(): EnvSet['oidc'] {
    return { ...mockEnvSet.oidc, cimdEnabled: true };
  }
}

describe('filterAndParseMissingResourceScopes', () => {
  const cimdEnvSet = new MockCimdEnvSet(defaultTenantId, EnvSet.values.dbUrl);
  const indicator = 'https://api.notes.com';
  const apiResource: Resource = { ...mockResource, id: 'resource_1', name: 'Notes API', indicator };
  const buildScope = (id: string, name: string): Scope => ({
    tenantId: 'default',
    id,
    resourceId: apiResource.id,
    name,
    description: null,
    createdAt: 0,
  });
  const globalOnlyScope = buildScope('scope_global', 'global:billing');
  const orgApiScope = buildScope('scope_org_api', 'org:doc');
  const orgScope: OrganizationScope = {
    tenantId: 'default',
    id: 'org_scope_1',
    name: 'invite:member',
    description: null,
  };
  const unconfiguredOrgScope: OrganizationScope = {
    tenantId: 'default',
    id: 'org_scope_2',
    name: 'org:admin',
    description: null,
  };

  const setupTenant = (orgRoleScopes: readonly ResourceScopeEntity[] = []) => {
    const findResourceByIndicator = jest.fn(async (target: string) =>
      target === indicator ? apiResource : null
    );
    const findApplicationById = jest.fn().mockResolvedValue({ isThirdParty: true });
    const findUserScopesForResourceIndicator = jest.fn().mockResolvedValue([globalOnlyScope]);
    const getUserResourceScopes = jest.fn().mockResolvedValue(orgRoleScopes);
    const findAllOrgScopes = jest.fn().mockResolvedValue([2, [orgScope, unconfiguredOrgScope]]);
    const scopesByName = new Map([
      [globalOnlyScope.name, globalOnlyScope],
      [orgApiScope.name, orgApiScope],
    ]);

    const tenant = new MockTenant(
      undefined,
      {
        resources: { findResourceByIndicator },
        scopes: {
          findScopeByNameAndResourceId: jest.fn(
            async (name: string) => scopesByName.get(name) ?? null
          ),
        },
        applications: { findApplicationById },
        cimd: {
          resourceScopes: {
            insert: jest.fn(),
            findAll: jest.fn().mockResolvedValue([globalOnlyScope]),
            delete: jest.fn(),
          },
          organizationResourceScopes: {
            insert: jest.fn(),
            findAll: jest.fn().mockResolvedValue([globalOnlyScope, orgApiScope]),
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
          getApplicationUserConsentResourceScopes: jest
            .fn()
            .mockResolvedValue([{ resource: apiResource, scopes: [globalOnlyScope] }]),
          getApplicationUserConsentOrganizationResourceScopes: jest
            .fn()
            .mockResolvedValue([{ resource: apiResource, scopes: [globalOnlyScope, orgApiScope] }]),
          getApplicationUserConsentOrganizationScopes: jest.fn().mockResolvedValue([orgScope]),
        },
      }
    );

    jest.spyOn(tenant.queries.organizations.scopes, 'findAll').mockImplementation(findAllOrgScopes);
    jest
      .spyOn(tenant.queries.organizations.relations.usersRoles, 'getUserResourceScopes')
      .mockImplementation(getUserResourceScopes);

    return {
      tenant,
      findResourceByIndicator,
      findApplicationById,
      findUserScopesForResourceIndicator,
      getUserResourceScopes,
      findAllOrgScopes,
    };
  };

  describe.each([
    { label: 'registered third-party app', applicationId: 'third_party_app_id', isCimd: false },
    {
      label: 'CIMD client',
      applicationId: 'https://client.example.com/metadata.json',
      isCimd: true,
    },
  ])('$label', ({ applicationId, isCimd }) => {
    it('resolves per-org API scopes from org roles only and excludes global-only scopes', async () => {
      const mocks = setupTenant([
        {
          id: orgApiScope.id,
          name: orgApiScope.name,
          resource: { id: apiResource.id, name: apiResource.name },
        },
      ]);

      const result = await filterAndParseMissingResourceScopes({
        resourceScopes: { [indicator]: [globalOnlyScope.name, orgApiScope.name] },
        envSet: isCimd ? cimdEnvSet : mocks.tenant.envSet,
        queries: mocks.tenant.queries,
        libraries: mocks.tenant.libraries,
        userId: 'alice',
        applicationId,
        organizationId: 'org_a',
      });

      expect(result.map(({ scopes }) => scopes.map(({ name }) => name))).toEqual([
        [orgApiScope.name],
      ]);
      expect(mocks.getUserResourceScopes).toHaveBeenCalledWith('alice', indicator, 'org_a');
      expect(mocks.findUserScopesForResourceIndicator).not.toHaveBeenCalled();
      if (isCimd) {
        expect(mocks.findApplicationById).not.toHaveBeenCalled();
      }
    });

    it('keeps personal global-role resolution when organizationId is omitted', async () => {
      const mocks = setupTenant();

      const result = await filterAndParseMissingResourceScopes({
        resourceScopes: { [indicator]: [globalOnlyScope.name, orgApiScope.name] },
        envSet: isCimd ? cimdEnvSet : mocks.tenant.envSet,
        queries: mocks.tenant.queries,
        libraries: mocks.tenant.libraries,
        userId: 'alice',
        applicationId,
      });

      expect(result.map(({ scopes }) => scopes.map(({ name }) => name))).toEqual([
        [globalOnlyScope.name],
      ]);
      expect(mocks.findUserScopesForResourceIndicator).toHaveBeenCalledWith(
        'alice',
        indicator,
        false,
        undefined
      );
      expect(mocks.getUserResourceScopes).not.toHaveBeenCalled();
    });

    it.each([undefined, 'org_a'])(
      'preserves ReservedResource.Organization short-circuit without querying resources (organizationId=%s)',
      async (orgId) => {
        const mocks = setupTenant();

        const result = await filterAndParseMissingResourceScopes({
          resourceScopes: {
            [ReservedResource.Organization]: [orgScope.name, unconfiguredOrgScope.name],
          },
          envSet: isCimd ? cimdEnvSet : mocks.tenant.envSet,
          queries: mocks.tenant.queries,
          libraries: mocks.tenant.libraries,
          userId: 'alice',
          applicationId,
          organizationId: orgId,
        });

        expect(result.map(({ scopes }) => scopes.map(({ name }) => name))).toEqual([
          [orgScope.name],
        ]);
        expect(mocks.findAllOrgScopes).toHaveBeenCalled();
        expect(mocks.getUserResourceScopes).not.toHaveBeenCalled();
        expect(mocks.findResourceByIndicator).not.toHaveBeenCalled();
      }
    );
  });
});
