import { ReservedResource } from '@logto/core-kit';
import {
  defaultTenantId,
  type OrganizationScope,
  type Resource,
  type ResourceScopeEntity,
  type Scope,
} from '@logto/schemas';

import { mockResource } from '#src/__mocks__/index.js';
import { EnvSet } from '#src/env-set/index.js';
import { mockEnvSet } from '#src/test-utils/env-set.js';
import { MockTenant } from '#src/test-utils/tenant.js';

import { resolveThirdPartyTokenScopes } from './token-route-scopes.js';

const { jest } = import.meta;

const indicator = 'https://api.notes.com';
const otherIndicator = 'https://api.other.com';
const registeredClientId = 'third_party_app_id';
const cimdClientId = 'https://client.example.com/client-metadata.json';
const userId = 'user_id';
const organizationId = 'org_a';

class MockCimdEnvSet extends EnvSet {
  override get oidc(): EnvSet['oidc'] {
    return { ...mockEnvSet.oidc, cimdEnabled: true };
  }
}

const cimdEnvSet = new MockCimdEnvSet(defaultTenantId, EnvSet.values.dbUrl);

const buildResource = (targetIndicator: string): Resource => ({
  ...mockResource,
  indicator: targetIndicator,
});

const buildScope = (id: string, name: string, resourceId = 'resource_1'): Scope => ({
  tenantId: 'default',
  id,
  resourceId,
  name,
  description: null,
  createdAt: 0,
});

const buildResourceScopeEntity = (id: string, name: string): ResourceScopeEntity => ({
  id,
  name,
  resource: {
    id: 'resource_1',
    name: 'Notes API',
  },
});

const buildOrganizationScope = (id: string, name: string): OrganizationScope => ({
  tenantId: 'default',
  id,
  name,
  description: null,
});

const createTenantWithMocks = () => {
  const findUserScopesForResourceIndicator = jest.fn(async (): Promise<readonly Scope[]> => []);
  const getUserResourceScopes = jest.fn(async (): Promise<readonly ResourceScopeEntity[]> => []);
  const getUserScopes = jest.fn(async (): Promise<readonly OrganizationScope[]> => []);
  const getApplicationUserConsentResourceScopes = jest.fn(
    async (): Promise<Array<{ resource: Resource; scopes: Scope[] }>> => []
  );
  const getApplicationUserConsentOrganizationResourceScopes = jest.fn(
    async (): Promise<Array<{ resource: Resource; scopes: Scope[] }>> => []
  );
  const getApplicationUserConsentOrganizationScopes = jest.fn(
    async (): Promise<readonly OrganizationScope[]> => []
  );
  const cimdResourceScopesFindAll = jest.fn(async (): Promise<readonly Scope[]> => []);
  const cimdOrganizationResourceScopesFindAll = jest.fn(async (): Promise<readonly Scope[]> => []);
  const cimdOrganizationScopesFindAll = jest.fn(
    async (): Promise<readonly OrganizationScope[]> => []
  );

  const tenant = new MockTenant(
    undefined,
    {
      cimd: {
        resourceScopes: {
          insert: jest.fn(),
          findAll: cimdResourceScopesFindAll,
          delete: jest.fn(),
        },
        organizationResourceScopes: {
          insert: jest.fn(),
          findAll: cimdOrganizationResourceScopesFindAll,
          delete: jest.fn(),
        },
        organizationScopes: {
          insert: jest.fn(),
          findAll: cimdOrganizationScopesFindAll,
          delete: jest.fn(),
        },
      },
    },
    undefined,
    {
      users: {
        findUserScopesForResourceIndicator,
      },
      applications: {
        getApplicationUserConsentResourceScopes,
        getApplicationUserConsentOrganizationResourceScopes,
        getApplicationUserConsentOrganizationScopes,
      },
    }
  );

  jest
    .spyOn(tenant.queries.organizations.relations.usersRoles, 'getUserResourceScopes')
    .mockImplementation(getUserResourceScopes);
  jest
    .spyOn(tenant.queries.organizations.relations.usersRoles, 'getUserScopes')
    .mockImplementation(getUserScopes);

  return {
    tenant,
    findUserScopesForResourceIndicator,
    getUserResourceScopes,
    getUserScopes,
    getApplicationUserConsentResourceScopes,
    getApplicationUserConsentOrganizationResourceScopes,
    getApplicationUserConsentOrganizationScopes,
    cimdResourceScopesFindAll,
    cimdOrganizationResourceScopesFindAll,
    cimdOrganizationScopesFindAll,
  };
};

describe('resolveThirdPartyTokenScopes()', () => {
  describe('Case 1: personal API token (indicator without organizationId)', () => {
    it('should intersect personal global roles with app resourceScopes for registered third-party apps', async () => {
      const mocks = createTenantWithMocks();
      const personalScope = buildScope('scope_personal', 'global:billing');
      const unconfiguredScope = buildScope('scope_unconfigured', 'global:admin');
      const orgOnlyScope = buildScope('scope_org_only', 'org:doc');

      mocks.findUserScopesForResourceIndicator.mockResolvedValue([
        personalScope,
        unconfiguredScope,
      ]);
      mocks.getApplicationUserConsentResourceScopes.mockResolvedValue([
        { resource: buildResource(indicator), scopes: [personalScope, orgOnlyScope] },
      ]);
      mocks.getApplicationUserConsentOrganizationResourceScopes.mockResolvedValue([
        { resource: buildResource(indicator), scopes: [orgOnlyScope] },
      ]);

      const scopes = await resolveThirdPartyTokenScopes({
        envSet: mocks.tenant.envSet,
        queries: mocks.tenant.queries,
        libraries: mocks.tenant.libraries,
        clientId: registeredClientId,
        userId,
        indicator,
      });

      expect(scopes).toEqual([personalScope]);
      // Must query personal global roles ONLY (`findFromOrganizations: false`).
      expect(mocks.findUserScopesForResourceIndicator).toHaveBeenCalledWith(
        userId,
        indicator,
        false
      );
      expect(mocks.getUserResourceScopes).not.toHaveBeenCalled();
      expect(mocks.getApplicationUserConsentResourceScopes).toHaveBeenCalledWith(
        registeredClientId
      );
      expect(mocks.getApplicationUserConsentOrganizationResourceScopes).not.toHaveBeenCalled();
    });

    it('should intersect personal global roles with cimd_resource_scopes for CIMD clients', async () => {
      const mocks = createTenantWithMocks();
      const personalScope = buildScope('scope_personal', 'global:billing');
      const otherResourceSameName = buildScope('scope_other_res', 'global:admin', 'resource_2');
      const unconfiguredScope = buildScope('scope_unconfigured', 'global:admin');
      const orgOnlyScope = buildScope('scope_org_only', 'org:doc');

      mocks.findUserScopesForResourceIndicator.mockResolvedValue([
        personalScope,
        unconfiguredScope,
      ]);
      mocks.cimdResourceScopesFindAll.mockResolvedValue([personalScope, otherResourceSameName]);
      mocks.cimdOrganizationResourceScopesFindAll.mockResolvedValue([orgOnlyScope]);

      const scopes = await resolveThirdPartyTokenScopes({
        envSet: cimdEnvSet,
        queries: mocks.tenant.queries,
        libraries: mocks.tenant.libraries,
        clientId: cimdClientId,
        userId,
        indicator,
      });

      expect(scopes).toEqual([personalScope]);
      expect(mocks.findUserScopesForResourceIndicator).toHaveBeenCalledWith(
        userId,
        indicator,
        false
      );
      expect(mocks.cimdResourceScopesFindAll).toHaveBeenCalledTimes(1);
      expect(mocks.cimdOrganizationResourceScopesFindAll).not.toHaveBeenCalled();
      expect(mocks.getApplicationUserConsentResourceScopes).not.toHaveBeenCalled();
    });
  });

  describe('Case 2: organization API token (indicator + organizationId)', () => {
    it('should intersect live org roles with app organizationResourceScopes for registered third-party apps', async () => {
      const mocks = createTenantWithMocks();
      const orgScope = buildResourceScopeEntity('scope_org', 'org:doc');
      const unconfiguredOrgScope = buildResourceScopeEntity('scope_org_extra', 'org:secret');
      const personalScope = buildScope('scope_personal', 'global:billing');

      mocks.getUserResourceScopes.mockResolvedValue([orgScope, unconfiguredOrgScope]);
      mocks.getApplicationUserConsentResourceScopes.mockResolvedValue([
        { resource: buildResource(indicator), scopes: [personalScope] },
      ]);
      mocks.getApplicationUserConsentOrganizationResourceScopes.mockResolvedValue([
        { resource: buildResource(indicator), scopes: [buildScope('scope_org', 'org:doc')] },
        {
          resource: buildResource(otherIndicator),
          scopes: [buildScope('scope_org_extra', 'org:secret', 'resource_2')],
        },
      ]);

      const scopes = await resolveThirdPartyTokenScopes({
        envSet: mocks.tenant.envSet,
        queries: mocks.tenant.queries,
        libraries: mocks.tenant.libraries,
        clientId: registeredClientId,
        userId,
        indicator,
        organizationId,
      });

      expect(scopes).toEqual([orgScope]);
      // Must query live org-only roles directly and never pull in personal global roles.
      expect(mocks.getUserResourceScopes).toHaveBeenCalledWith(userId, indicator, organizationId);
      expect(mocks.findUserScopesForResourceIndicator).not.toHaveBeenCalled();
      expect(mocks.getApplicationUserConsentOrganizationResourceScopes).toHaveBeenCalledWith(
        registeredClientId
      );
      expect(mocks.getApplicationUserConsentResourceScopes).not.toHaveBeenCalled();
    });

    it('should intersect live org roles with cimd_organization_resource_scopes for CIMD clients', async () => {
      const mocks = createTenantWithMocks();
      const orgScope = buildResourceScopeEntity('scope_org', 'org:doc');
      const personalScope = buildScope('scope_personal', 'global:billing');

      mocks.getUserResourceScopes.mockResolvedValue([orgScope]);
      mocks.cimdResourceScopesFindAll.mockResolvedValue([personalScope]);
      mocks.cimdOrganizationResourceScopesFindAll.mockResolvedValue([
        buildScope('scope_org', 'org:doc'),
      ]);

      const scopes = await resolveThirdPartyTokenScopes({
        envSet: cimdEnvSet,
        queries: mocks.tenant.queries,
        libraries: mocks.tenant.libraries,
        clientId: cimdClientId,
        userId,
        indicator,
        organizationId,
      });

      expect(scopes).toEqual([orgScope]);
      expect(mocks.getUserResourceScopes).toHaveBeenCalledWith(userId, indicator, organizationId);
      expect(mocks.findUserScopesForResourceIndicator).not.toHaveBeenCalled();
      expect(mocks.cimdOrganizationResourceScopesFindAll).toHaveBeenCalledTimes(1);
      expect(mocks.cimdResourceScopesFindAll).not.toHaveBeenCalled();
      expect(mocks.getApplicationUserConsentOrganizationResourceScopes).not.toHaveBeenCalled();
    });
  });

  describe('Case 3: organization token (organizationId without indicator)', () => {
    it('should intersect live org scopes with app organizationScopes for registered third-party apps', async () => {
      const mocks = createTenantWithMocks();
      const inviteScope = buildOrganizationScope('org_scope_1', 'invite:member');
      const readScope = buildOrganizationScope('org_scope_2', 'read');

      mocks.getUserScopes.mockResolvedValue([inviteScope, readScope]);
      mocks.getApplicationUserConsentOrganizationScopes.mockResolvedValue([inviteScope]);

      const scopes = await resolveThirdPartyTokenScopes({
        envSet: mocks.tenant.envSet,
        queries: mocks.tenant.queries,
        libraries: mocks.tenant.libraries,
        clientId: registeredClientId,
        userId,
        organizationId,
      });

      expect(scopes).toEqual([inviteScope]);
      expect(mocks.getUserScopes).toHaveBeenCalledWith(organizationId, userId);
      expect(mocks.getApplicationUserConsentOrganizationScopes).toHaveBeenCalledWith(
        registeredClientId
      );
    });

    it('should intersect live org scopes with cimd_organization_scopes for CIMD clients', async () => {
      const mocks = createTenantWithMocks();
      const inviteScope = buildOrganizationScope('org_scope_1', 'invite:member');
      const readScope = buildOrganizationScope('org_scope_2', 'read');

      mocks.getUserScopes.mockResolvedValue([inviteScope, readScope]);
      mocks.cimdOrganizationScopesFindAll.mockResolvedValue([inviteScope]);

      const scopes = await resolveThirdPartyTokenScopes({
        envSet: cimdEnvSet,
        queries: mocks.tenant.queries,
        libraries: mocks.tenant.libraries,
        clientId: cimdClientId,
        userId,
        organizationId,
      });

      expect(scopes).toEqual([inviteScope]);
      expect(mocks.getUserScopes).toHaveBeenCalledWith(organizationId, userId);
      expect(mocks.cimdOrganizationScopesFindAll).toHaveBeenCalledTimes(1);
      expect(mocks.getApplicationUserConsentOrganizationScopes).not.toHaveBeenCalled();
    });
  });

  describe('Case 4 & missing user subject', () => {
    it.each([
      { label: 'registered third-party without org', clientId: registeredClientId, isCimd: false },
      {
        label: 'registered third-party with org',
        clientId: registeredClientId,
        isCimd: false,
        orgId: organizationId,
      },
      { label: 'CIMD without org', clientId: cimdClientId, isCimd: true },
      { label: 'CIMD with org', clientId: cimdClientId, isCimd: true, orgId: organizationId },
    ])(
      'should return empty scopes for ReservedResource.Organization ($label)',
      async ({ clientId, isCimd, orgId }) => {
        const mocks = createTenantWithMocks();

        const scopes = await resolveThirdPartyTokenScopes({
          envSet: isCimd ? cimdEnvSet : mocks.tenant.envSet,
          queries: mocks.tenant.queries,
          libraries: mocks.tenant.libraries,
          clientId,
          userId,
          indicator: ReservedResource.Organization,
          organizationId: orgId,
        });

        expect(scopes).toEqual([]);
        expect(mocks.findUserScopesForResourceIndicator).not.toHaveBeenCalled();
        expect(mocks.getUserResourceScopes).not.toHaveBeenCalled();
        expect(mocks.getUserScopes).not.toHaveBeenCalled();
      }
    );

    it('should return empty scopes when userId is absent (e.g. PAR / device_authorization)', async () => {
      const mocks = createTenantWithMocks();

      const registeredScopes = await resolveThirdPartyTokenScopes({
        envSet: mocks.tenant.envSet,
        queries: mocks.tenant.queries,
        libraries: mocks.tenant.libraries,
        clientId: registeredClientId,
        indicator,
      });
      const cimdScopes = await resolveThirdPartyTokenScopes({
        envSet: cimdEnvSet,
        queries: mocks.tenant.queries,
        libraries: mocks.tenant.libraries,
        clientId: cimdClientId,
        indicator,
      });

      expect(registeredScopes).toEqual([]);
      expect(cimdScopes).toEqual([]);
      expect(mocks.findUserScopesForResourceIndicator).not.toHaveBeenCalled();
      expect(mocks.getUserResourceScopes).not.toHaveBeenCalled();
    });
  });
});
