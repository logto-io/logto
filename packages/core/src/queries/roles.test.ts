import { Roles } from '@logto/schemas';
import { createMockPool, createMockQueryResult, sql } from '@silverhand/slonik';

import { mockAdminUserRole } from '#src/__mocks__/index.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';
import {
  convertToIdentifiers,
  convertToPrimitiveOrSql,
  excludeAutoSetFields,
} from '#src/utils/sql.js';
import type { QueryType } from '#src/utils/test-utils.js';
import { expectSqlAssert } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const mockQuery: jest.MockedFunction<QueryType> = jest.fn();

const pool = createMockPool({
  query: async (sql, values) => {
    return mockQuery(sql, values);
  },
});

const { createRolesQueries } = await import('./roles.js');
const {
  deleteRoleById,
  findRoleById,
  findRoleByRoleName,
  findRolesByRoleIds,
  findRolesByRoleNames,
  insertRole,
  insertRoles,
  updateRoleById,
} = createRolesQueries(pool);

describe('roles query', () => {
  const { table, fields } = convertToIdentifiers(Roles);

  it('findRolesByRoleIds', async () => {
    const roleIds = [mockAdminUserRole.id];
    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.id} in (${sql.join(roleIds, sql`, `)})
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([roleIds.join(', ')]);

      return createMockQueryResult([mockAdminUserRole]);
    });

    await expect(findRolesByRoleIds(roleIds)).resolves.toEqual([mockAdminUserRole]);
  });

  it('findRoleByRoleName', async () => {
    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.name} = ${mockAdminUserRole.name}
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([mockAdminUserRole.name]);

      return createMockQueryResult([mockAdminUserRole]);
    });

    await expect(findRoleByRoleName(mockAdminUserRole.name)).resolves.toEqual(mockAdminUserRole);
  });

  it('findRoleByRoleName with excludeRoleId', async () => {
    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.name} = ${mockAdminUserRole.name}
      and ${fields.id}<>${mockAdminUserRole.id}
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([mockAdminUserRole.name, mockAdminUserRole.id]);

      return createMockQueryResult([mockAdminUserRole]);
    });

    await expect(findRoleByRoleName(mockAdminUserRole.name, mockAdminUserRole.id)).resolves.toEqual(
      mockAdminUserRole
    );
  });

  it('findRolesByRoleNames', async () => {
    const roleNames = ['foo'];

    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.name} in (${sql.join(roleNames, sql`, `)})
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([roleNames.join(', ')]);

      return createMockQueryResult([mockAdminUserRole]);
    });

    await expect(findRolesByRoleNames(roleNames)).resolves.toEqual([mockAdminUserRole]);
  });

  it('insertRoles', async () => {
    const expectSql = sql`
      insert into ${table} (${fields.id}, ${fields.name}, ${fields.description}) values
      ($1, $2, $3)
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);

      expect(values).toEqual([
        mockAdminUserRole.id,
        mockAdminUserRole.name,
        mockAdminUserRole.description,
      ]);

      return createMockQueryResult([mockAdminUserRole]);
    });

    await insertRoles([mockAdminUserRole]);
  });

  it('insertRole', async () => {
    const keys = excludeAutoSetFields(Roles.fieldKeys);

    const expectSql = `
      insert into "roles" ("id", "name", "description", "type", "is_default")
      values (${keys.map((_, index) => `$${index + 1}`).join(', ')})
      returning *
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      const rowData = { id: 'foo' };
      expectSqlAssert(sql, expectSql);

      expect(values).toEqual(keys.map((k) => convertToPrimitiveOrSql(k, mockAdminUserRole[k])));

      return createMockQueryResult([rowData]);
    });

    await insertRole(mockAdminUserRole);
  });

  it('findRoleById', async () => {
    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.id}=$1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([mockAdminUserRole.id]);

      return createMockQueryResult([mockAdminUserRole]);
    });

    await findRoleById(mockAdminUserRole.id);
  });

  it('updateRoleById', async () => {
    const { id, description } = mockAdminUserRole;

    const expectSql = sql`
      update ${table}
      set ${fields.description}=$1
      where ${fields.id}=$2
      returning *
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([description, id]);

      return createMockQueryResult([{ id, description }]);
    });

    await updateRoleById(id, { description });
  });

  it('deleteRoleById', async () => {
    const expectSql = sql`
      delete from ${table}
      where ${fields.id}=$1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([mockAdminUserRole.id]);

      return createMockQueryResult([mockAdminUserRole]);
    });

    await deleteRoleById(mockAdminUserRole.id);
  });

  it('deleteRoleById throw error if return row count is 0', async () => {
    const { id } = mockAdminUserRole;

    mockQuery.mockImplementationOnce(async () => {
      return createMockQueryResult([]);
    });

    await expect(deleteRoleById(id)).rejects.toMatchError(new DeletionError(Roles.table, id));
  });
});
