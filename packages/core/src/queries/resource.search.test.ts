import {
  managementApiIndicatorPattern,
  Resources,
  RolesScopes,
  Scopes,
  SearchJointMode,
  SearchMatchMode,
} from '@logto/schemas';
import { createMockPool, createMockQueryResult, sql } from '@silverhand/slonik';

import { mockResource } from '#src/__mocks__/index.js';
import { MockWellKnownCache } from '#src/test-utils/tenant.js';
import { convertToIdentifiers } from '#src/utils/sql.js';
import type { QueryType } from '#src/utils/test-utils.js';
import { expectSqlAssert } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const mockQuery: jest.MockedFunction<QueryType> = jest.fn();

const pool = createMockPool({
  query: async (sql, values) => {
    return mockQuery(sql, values);
  },
});
const wellKnownCache = new MockWellKnownCache();

const { createResourceQueries } = await import('./resource.js');
const { findTotalNumberOfResources, findAllResources } = createResourceQueries(
  pool,
  wellKnownCache
);

describe('resource query search and scope filters', () => {
  const { table, fields } = convertToIdentifiers(Resources);
  const resources = convertToIdentifiers(Resources, true);
  const scopes = convertToIdentifiers(Scopes, true);
  const rolesScopes = convertToIdentifiers(RolesScopes, true);

  afterEach(() => {
    mockQuery.mockClear();
  });

  it('findTotalNumberOfResources excluding Management API', async () => {
    const expectSql = sql`
      select count(*)
      from ${table}
      where ${fields.indicator} !~ ${managementApiIndicatorPattern}
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual(expectSql.values);

      return createMockQueryResult([{ count: 10 }]);
    });

    await expect(findTotalNumberOfResources({ excludeManagementApis: true })).resolves.toEqual({
      count: 10,
    });
  });

  it('findAllResources excluding Management API', async () => {
    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.indicator} !~ ${managementApiIndicatorPattern}
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual(expectSql.values);

      return createMockQueryResult([mockResource]);
    });

    await expect(findAllResources({ excludeManagementApis: true })).resolves.toEqual([
      mockResource,
    ]);
  });

  it('findTotalNumberOfResources with hasScopes and excludeRoleId', async () => {
    const roleId = 'role-1';

    const expectSql = sql`
      select count(*)
      from ${table}
      where exists (
        select 1
        from ${scopes.table}
        where ${scopes.fields.resourceId} = ${resources.fields.id}
        and not exists (
          select 1
          from ${rolesScopes.table}
          where ${rolesScopes.fields.roleId} = ${roleId}
          and ${rolesScopes.fields.scopeId} = ${scopes.fields.id}
        )
      )
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual(expectSql.values);

      return createMockQueryResult([{ count: 3 }]);
    });

    await expect(
      findTotalNumberOfResources({ hasScopes: true, excludeRoleId: roleId })
    ).resolves.toEqual({ count: 3 });
  });

  it('findAllResources with general search and excludeRoleId', async () => {
    const keyword = '%read%';
    const roleId = 'role-1';

    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where (((${fields.id} ~~* $1 or ${fields.name} ~~* $2 or ${fields.indicator} ~~* $3) or exists (
        select 1
        from ${scopes.table}
        where ${scopes.fields.resourceId} = ${resources.fields.id}
        and (${fields.name} ~~* $4)
        and not exists (
          select 1
          from ${rolesScopes.table}
          where ${rolesScopes.fields.roleId} = $5
          and ${rolesScopes.fields.scopeId} = ${scopes.fields.id}
        )
      )))
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([keyword, keyword, keyword, keyword, roleId]);

      return createMockQueryResult([mockResource]);
    });

    await expect(
      findAllResources({
        excludeRoleId: roleId,
        search: {
          matches: [{ mode: SearchMatchMode.Like, values: [keyword] }],
          joint: SearchJointMode.Or,
          isCaseSensitive: false,
        },
      })
    ).resolves.toEqual([mockResource]);
  });

  it('findAllResources with field-specific search', async () => {
    const keyword = '%api%';

    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ((${fields.indicator} ~~* $1))
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([keyword]);

      return createMockQueryResult([mockResource]);
    });

    await expect(
      findAllResources({
        search: {
          matches: [{ mode: SearchMatchMode.Like, field: 'indicator', values: [keyword] }],
          joint: SearchJointMode.Or,
          isCaseSensitive: false,
        },
      })
    ).resolves.toEqual([mockResource]);
  });
});
