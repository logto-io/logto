import { ReservedResource } from '@logto/core-kit';
import { type OrganizationScope, type Scope } from '@logto/schemas';

import { MockQueries } from '#src/test-utils/tenant.js';

import { filterResourceScopesForTheCimdClient } from './resource-scopes.js';

const { jest } = import.meta;

const indicator = 'https://foo.logto.io/api';
const resourceId = 'resource_id';

const buildScope = (id: string, name: string): Scope => ({
  tenantId: 'tenant_id',
  id,
  resourceId,
  name,
  description: null,
  createdAt: 0,
});

const buildOrganizationScope = (id: string, name: string): OrganizationScope => ({
  tenantId: 'tenant_id',
  id,
  name,
  description: null,
});

const buildCeilingQueries = ({
  resourceScopes = [],
  organizationResourceScopes = [],
  organizationScopes = [],
}: {
  resourceScopes?: readonly Scope[];
  organizationResourceScopes?: readonly Scope[];
  organizationScopes?: readonly OrganizationScope[];
}) =>
  new MockQueries({
    cimd: {
      resourceScopes: {
        insert: jest.fn(),
        findAll: jest.fn().mockResolvedValue(resourceScopes),
        delete: jest.fn(),
      },
      organizationResourceScopes: {
        insert: jest.fn(),
        findAll: jest.fn().mockResolvedValue(organizationResourceScopes),
        delete: jest.fn(),
      },
      organizationScopes: {
        insert: jest.fn(),
        findAll: jest.fn().mockResolvedValue(organizationScopes),
        delete: jest.fn(),
      },
    },
  });

describe('filterResourceScopesForTheCimdClient', () => {
  it('should keep only the scopes within the resource and organization resource ceilings', async () => {
    const queries = buildCeilingQueries({
      resourceScopes: [buildScope('scope_1', 'read:api')],
      organizationResourceScopes: [buildScope('scope_3', 'read:organization-api')],
    });

    const filtered = await filterResourceScopesForTheCimdClient(queries, indicator, [
      buildScope('scope_1', 'read:api'),
      buildScope('scope_2', 'write:api'),
      buildScope('scope_3', 'read:organization-api'),
    ]);

    expect(filtered.map(({ name }) => name)).toEqual(['read:api', 'read:organization-api']);
  });

  it('should drop every scope when the ceiling is empty', async () => {
    const queries = buildCeilingQueries({});

    const filtered = await filterResourceScopesForTheCimdClient(queries, indicator, [
      buildScope('scope_1', 'read:api'),
      buildScope('scope_2', 'write:api'),
    ]);

    expect(filtered).toEqual([]);
  });

  it('should filter the reserved organization resource through the organization scope ceiling', async () => {
    const queries = buildCeilingQueries({
      organizationScopes: [buildOrganizationScope('org_scope_1', 'read:members')],
    });

    const filtered = await filterResourceScopesForTheCimdClient(
      queries,
      ReservedResource.Organization,
      [
        { id: 'org_scope_1', name: 'read:members' },
        { id: 'org_scope_2', name: 'manage:members' },
      ]
    );

    expect(filtered.map(({ name }) => name)).toEqual(['read:members']);
  });
});
