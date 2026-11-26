import type { CommonQueryMethods } from '@silverhand/slonik';
import { describe, expect, it, vi } from 'vitest';

import { managementApiScopeCatalog } from '../../src/seeds/management-api-scopes.js';

import {
  backfillManagementApiScopes,
  managementApiScopeSnapshot,
  revertManagementApiScopes,
  verifyManagementApiScopes,
} from './1795671845-backfill-management-api-scopes.js';

const createMockConnection = () => {
  const any = vi.fn();
  const one = vi.fn();
  const query = vi.fn();

  return {
    any,
    one,
    query,
    connection: { any, one, query } as unknown as CommonQueryMethods,
  };
};

describe('backfillManagementApiScopes', () => {
  it('snapshot matches the live Management API scope catalog', () => {
    expect(managementApiScopeSnapshot).toEqual(managementApiScopeCatalog);
  });

  it('inserts only missing scopes and skips existing ones', async () => {
    const { any, query, connection } = createMockConnection();

    any
      // First batch of tenants (< batchSize so loop stops after this batch)
      .mockResolvedValueOnce([{ id: 'tenant-1' }])
      // Local Management API resources for the batch
      .mockResolvedValueOnce([{ tenantId: 'tenant-1', resourceId: 'res-1' }])
      // Existing scopes (1 already present)
      .mockResolvedValueOnce([{ tenantId: 'tenant-1', resourceId: 'res-1', name: 'read:users' }]);

    query.mockResolvedValueOnce({ rowCount: managementApiScopeSnapshot.length - 1 });

    await backfillManagementApiScopes(connection);

    expect(any).toHaveBeenCalledTimes(3);
    expect(query).toHaveBeenCalledTimes(1);

    const insertQuery = query.mock.calls[0]?.[0] as { sql: string; values: unknown[] };
    expect(insertQuery.sql).toContain('on conflict (tenant_id, resource_id, name) do nothing');
    // Unnest receives 5 column arrays; each array has 29 missing rows
    const insertedNames = insertQuery.values[3] as string[];
    expect(insertedNames).toHaveLength(managementApiScopeSnapshot.length - 1);
    expect(insertedNames).not.toContain('read:users');
  });

  it('performs no writes when all scopes already exist (idempotent rerun)', async () => {
    const { any, query, connection } = createMockConnection();

    any
      .mockResolvedValueOnce([{ id: 'tenant-1' }])
      .mockResolvedValueOnce([{ tenantId: 'tenant-1', resourceId: 'res-1' }])
      .mockResolvedValueOnce(
        managementApiScopeSnapshot.map(({ name }) => ({
          tenantId: 'tenant-1',
          resourceId: 'res-1',
          name,
        }))
      );

    await backfillManagementApiScopes(connection);

    expect(query).not.toHaveBeenCalled();
  });

  it('handles empty tenant set cleanly', async () => {
    const { any, query, connection } = createMockConnection();
    any.mockResolvedValueOnce([]);

    await backfillManagementApiScopes(connection);

    expect(any).toHaveBeenCalledTimes(1);
    expect(query).not.toHaveBeenCalled();
  });
});

describe('verifyManagementApiScopes', () => {
  it('succeeds when all eligible tenants have their resource and all 30 scopes', async () => {
    const { one, connection } = createMockConnection();
    one.mockResolvedValueOnce({ missingResourceTenants: 0, incompleteScopeTenants: 0 });

    await expect(verifyManagementApiScopes(connection)).resolves.toBeUndefined();
  });

  it('throws when any tenant is missing its local Management API resource', async () => {
    const { one, connection } = createMockConnection();
    one.mockResolvedValueOnce({ missingResourceTenants: 1, incompleteScopeTenants: 0 });

    await expect(verifyManagementApiScopes(connection)).rejects.toThrow(
      '1 tenant(s) missing local Management API resource'
    );
  });

  it('throws when any tenant is missing catalog scopes', async () => {
    const { one, connection } = createMockConnection();
    one.mockResolvedValueOnce({ missingResourceTenants: 0, incompleteScopeTenants: 2 });

    await expect(verifyManagementApiScopes(connection)).rejects.toThrow(
      '2 tenant(s) missing catalog scopes'
    );
  });
});

describe('revertManagementApiScopes', () => {
  it('deletes only snapshot catalog scopes on non-admin local Management API resources', async () => {
    const { query, connection } = createMockConnection();
    query.mockResolvedValueOnce({ rowCount: 30 });

    await revertManagementApiScopes(connection);

    expect(query).toHaveBeenCalledTimes(1);
    const deleteQuery = query.mock.calls[0]?.[0] as { sql: string };
    expect(deleteQuery.sql).toContain('delete from scopes');
    expect(deleteQuery.sql).toContain(
      "indicator = 'https://' || scopes.tenant_id || '.logto.app/api'"
    );
  });
});
