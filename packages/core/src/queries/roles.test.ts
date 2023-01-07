import { Roles } from '@logto/schemas';
import { convertToIdentifiers, convertToPrimitiveOrSql, excludeAutoSetFields } from '@logto/shared';
import { createMockPool, createMockQueryResult, sql } from 'slonik';

import { mockRole } from '#src/__mocks__/index.js';
import envSet from '#src/env-set/index.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';
import type { QueryType } from '#src/utils/test-utils.js';
import { expectSqlAssert } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const mockQuery: jest.MockedFunction<QueryType> = jest.fn();

jest.spyOn(envSet, 'pool', 'get').mockReturnValue(
  createMockPool({
    query: async (sql, values) => {
      return mockQuery(sql, values);
    },
  })
);

const {
  deleteRoleById,
  findAllRoles,
  findRoleById,
  findRoleByRoleName,
  findRolesByRoleIds,
  findRolesByRoleNames,
  insertRole,
  insertRoles,
  updateRoleById,
} = await import('./roles.js');

describe('roles query', () => {
  const { table, fields } = convertToIdentifiers(Roles);

  it('findAllRoles', async () => {
    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([]);

      return createMockQueryResult([mockRole]);
    });

    await expect(findAllRoles()).resolves.toEqual([mockRole]);
  });

  it('findRolesByRoleIds', async () => {
    const roleIds = [mockRole.id];
    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.id} in (${sql.join(roleIds, sql`, `)})
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([roleIds.join(', ')]);

      return createMockQueryResult([mockRole]);
    });

    await expect(findRolesByRoleIds(roleIds)).resolves.toEqual([mockRole]);
  });

  it('findRoleByRoleName', async () => {
    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.name} = ${mockRole.name}
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([mockRole.name]);

      return createMockQueryResult([mockRole]);
    });

    await expect(findRoleByRoleName(mockRole.name)).resolves.toEqual(mockRole);
  });

  it('findRoleByRoleName with excludeRoleId', async () => {
    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.name} = ${mockRole.name}
      and ${fields.id}<>${mockRole.id}
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([mockRole.name, mockRole.id]);

      return createMockQueryResult([mockRole]);
    });

    await expect(findRoleByRoleName(mockRole.name, mockRole.id)).resolves.toEqual(mockRole);
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

      return createMockQueryResult([mockRole]);
    });

    await expect(findRolesByRoleNames(roleNames)).resolves.toEqual([mockRole]);
  });

  it('insertRoles', async () => {
    const expectSql = sql`
      insert into ${table} (${fields.id}, ${fields.name}, ${fields.description}) values
      ($1, $2, $3)
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);

      expect(values).toEqual([mockRole.id, mockRole.name, mockRole.description]);

      return createMockQueryResult([mockRole]);
    });

    await insertRoles([mockRole]);
  });

  it('insertRole', async () => {
    const keys = excludeAutoSetFields(Roles.fieldKeys);

    const expectSql = `
      insert into "roles" ("id", "name", "description")
      values (${keys.map((_, index) => `$${index + 1}`).join(', ')})
      returning *
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      const rowData = { id: 'foo' };
      expectSqlAssert(sql, expectSql);

      expect(values).toEqual(keys.map((k) => convertToPrimitiveOrSql(k, mockRole[k])));

      return createMockQueryResult([rowData]);
    });

    await insertRole(mockRole);
  });

  it('findRoleById', async () => {
    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.id}=$1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([mockRole.id]);

      return createMockQueryResult([mockRole]);
    });

    await findRoleById(mockRole.id);
  });

  it('updateRoleById', async () => {
    const { id, description } = mockRole;

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
      expect(values).toEqual([mockRole.id]);

      return createMockQueryResult([mockRole]);
    });

    await deleteRoleById(mockRole.id);
  });

  it('deleteRoleById throw error if return row count is 0', async () => {
    const { id } = mockRole;

    mockQuery.mockImplementationOnce(async () => {
      return createMockQueryResult([]);
    });

    await expect(deleteRoleById(id)).rejects.toMatchError(new DeletionError(Roles.table, id));
  });
});
