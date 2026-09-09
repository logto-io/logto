import { createMockPool, createMockQueryResult, sql } from '@silverhand/slonik';
import { beforeEach, describe, expect, it, vi, type MockedFunction } from 'vitest';

import type { QueryType } from '../test-utils.js';
import { expectSqlAssert } from '../test-utils.js';

import { assertNoExistingTenantRoles, getDatabaseName } from './database.js';

const mockQuery: MockedFunction<QueryType> = vi.fn();
const pool = createMockPool({
  query: async (query, values) => mockQuery(query, values),
});

beforeEach(() => {
  mockQuery.mockReset();
});

describe('getDatabaseName()', () => {
  it('returns the current database name and optionally normalizes hyphens', async () => {
    mockQuery.mockResolvedValueOnce(createMockQueryResult([{ currentDatabase: 'logto-db' }]));

    await expect(getDatabaseName(pool)).resolves.toBe('logto-db');

    mockQuery.mockResolvedValueOnce(createMockQueryResult([{ currentDatabase: 'logto-db' }]));

    await expect(getDatabaseName(pool, true)).resolves.toBe('logto_db');
  });
});

describe('assertNoExistingTenantRoles()', () => {
  const database = 'logto';
  const roleNames = [
    'logto_tenant_logto',
    'logto_tenant_logto_default',
    'logto_tenant_logto_admin',
  ];
  const expectedSql = sql`
    select rolname as "roleName"
    from pg_roles
    where rolname in (${sql.join(
      roleNames.map((roleName) => sql`${roleName}`),
      sql`, `
    )})
    order by rolname
  `;

  it('resolves when none of the seed roles exist', async () => {
    mockQuery.mockImplementationOnce(async (query, values) => {
      expectSqlAssert(query, expectedSql.sql);
      expect(values).toEqual(roleNames);

      return createMockQueryResult([]);
    });

    await expect(assertNoExistingTenantRoles(pool, database)).resolves.toBeUndefined();
  });

  it('reports existing roles before the seed can create them', async () => {
    mockQuery.mockResolvedValueOnce(createMockQueryResult([{ roleName: 'logto_tenant_logto' }]));

    await expect(assertNoExistingTenantRoles(pool, database)).rejects.toThrow(
      [
        'Cannot seed database "logto" because these PostgreSQL roles already exist:',
        '  - logto_tenant_logto',
        '',
        'PostgreSQL roles are cluster-wide and are not removed when a database is dropped.',
        'Verify that the roles belong to an old Logto installation, remove them as a PostgreSQL administrator, and run the seed command again.',
      ].join('\n')
    );
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });
});
