import { Resources } from '@logto/schemas';
import { createMockPool, createMockQueryResult, sql } from '@silverhand/slonik';

import { mockResource } from '#src/__mocks__/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { MockWellKnownCache } from '#src/test-utils/tenant.js';
import { convertToIdentifiers, convertToPrimitiveOrSql } from '#src/utils/sql.js';
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
const {
  findTotalNumberOfResources,
  findAllResources,
  findResourceById,
  findResourceByIndicator,
  findResourceForOidcByIndicator,
  insertResource,
  updateResourceById,
  deleteResourceById,
} = createResourceQueries(pool, wellKnownCache);

describe('resource query', () => {
  const { table, fields } = convertToIdentifiers(Resources);

  afterEach(() => {
    mockQuery.mockClear();
    wellKnownCache.ttlCache.clear();
  });

  it('findTotalNumberOfResources', async () => {
    const expectSql = sql`
      select count(*)
      from ${table}
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual(expectSql.values);

      return createMockQueryResult([{ count: 10 }]);
    });

    await expect(findTotalNumberOfResources()).resolves.toEqual({ count: 10 });
  });

  it('findAllResources', async () => {
    const limit = 10;
    const offset = 1;

    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      limit $1
      offset $2
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([limit, offset]);

      return createMockQueryResult([mockResource]);
    });

    await expect(findAllResources(limit, offset)).resolves.toEqual([mockResource]);
  });

  it('findResourcesById', async () => {
    const id = 'foo';

    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.id}=$1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([id]);

      return createMockQueryResult([mockResource]);
    });

    await expect(findResourceById(id)).resolves.toEqual(mockResource);
  });

  it('findResourceByIndicator', async () => {
    const indicator = 'foo';

    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.indicator}=$1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([indicator]);

      return createMockQueryResult([mockResource]);
    });

    await expect(findResourceByIndicator(indicator)).resolves.toEqual(mockResource);
  });

  it('findResourceForOidcByIndicator caches the minimal projection', async () => {
    const { indicator } = mockResource;
    const expectSql = sql`
      select ${sql.join([fields.indicator, fields.accessTokenTtl], sql`, `)}
      from ${table}
      where ${fields.indicator}=$1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([indicator]);

      return createMockQueryResult([{ indicator, accessTokenTtl: mockResource.accessTokenTtl }]);
    });

    await expect(findResourceForOidcByIndicator(indicator)).resolves.toEqual({
      indicator,
      accessTokenTtl: mockResource.accessTokenTtl,
    });
    await expect(findResourceForOidcByIndicator(indicator)).resolves.toEqual({
      indicator,
      accessTokenTtl: mockResource.accessTokenTtl,
    });
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it('insertResource invalidates cached null resource projection', async () => {
    const insertedResource = {
      ...mockResource,
      indicator: 'https://foo.dev/api',
    };
    const expectFindSql = sql`
      select ${sql.join([fields.indicator, fields.accessTokenTtl], sql`, `)}
      from ${table}
      where ${fields.indicator}=$1
    `;
    const insertFields = Object.values(fields).filter((field) => field.names[0] !== 'tenant_id');
    const expectInsertSql = sql`
      insert into ${table} (${sql.join(insertFields, sql`, `)})
      values (${sql.join(
        insertFields.map((_, index) => `$${index + 1}`),
        sql`, `
      )})
      returning *
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectFindSql.sql);
      expect(values).toEqual([insertedResource.indicator]);

      return createMockQueryResult([]);
    });

    await expect(findResourceForOidcByIndicator(insertedResource.indicator)).resolves.toBeNull();

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectInsertSql.sql);
      expect(values).toEqual(
        Resources.fieldKeys
          .filter((key) => key !== 'tenantId')
          .map((key) => convertToPrimitiveOrSql(key, insertedResource[key]))
      );

      return createMockQueryResult([insertedResource]);
    });

    await insertResource(insertedResource);

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectFindSql.sql);
      expect(values).toEqual([insertedResource.indicator]);

      return createMockQueryResult([
        {
          indicator: insertedResource.indicator,
          accessTokenTtl: insertedResource.accessTokenTtl,
        },
      ]);
    });

    await expect(findResourceForOidcByIndicator(insertedResource.indicator)).resolves.toEqual({
      indicator: insertedResource.indicator,
      accessTokenTtl: insertedResource.accessTokenTtl,
    });
  });

  it('insertResource', async () => {
    const insertFields = Object.values(fields).filter((field) => field.names[0] !== 'tenant_id');
    const expectSql = sql`
      insert into ${table} (${sql.join(insertFields, sql`, `)})
      values (${sql.join(
        insertFields.map((_, index) => `$${index + 1}`),
        sql`, `
      )})
      returning *
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);

      expect(values).toEqual(
        Resources.fieldKeys
          .filter((key) => key !== 'tenantId')
          .map((k) => convertToPrimitiveOrSql(k, mockResource[k]))
      );

      return createMockQueryResult([mockResource]);
    });

    await expect(insertResource(mockResource)).resolves.toEqual(mockResource);
  });

  it('updateResourceById', async () => {
    const id = 'foo';
    const name = 'foo';
    const updatedResource = { ...mockResource, name };
    const expectFindByIdSql = sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.id}=$1
    `;

    const expectSql = sql`
      update ${table}
      set ${fields.name}=$1
      where ${fields.id}=$2
      returning *
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectFindByIdSql.sql);
      expect(values).toEqual([id]);

      return createMockQueryResult([mockResource]);
    });

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([name, id]);

      return createMockQueryResult([updatedResource]);
    });

    await expect(updateResourceById(id, { name })).resolves.toEqual(updatedResource);
  });

  it('updateResourceById invalidates cached resource projection', async () => {
    const { id } = mockResource;
    const updatedAccessTokenTtl = 7200;
    const expectFindProjectionSql = sql`
      select ${sql.join([fields.indicator, fields.accessTokenTtl], sql`, `)}
      from ${table}
      where ${fields.indicator}=$1
    `;
    const expectFindByIdSql = sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.id}=$1
    `;
    const expectUpdateSql = sql`
      update ${table}
      set ${fields.accessTokenTtl}=$1
      where ${fields.id}=$2
      returning *
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectFindProjectionSql.sql);
      expect(values).toEqual([mockResource.indicator]);

      return createMockQueryResult([
        {
          indicator: mockResource.indicator,
          accessTokenTtl: mockResource.accessTokenTtl,
        },
      ]);
    });

    await expect(findResourceForOidcByIndicator(mockResource.indicator)).resolves.toEqual({
      indicator: mockResource.indicator,
      accessTokenTtl: mockResource.accessTokenTtl,
    });

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectFindByIdSql.sql);
      expect(values).toEqual([id]);

      return createMockQueryResult([mockResource]);
    });

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectUpdateSql.sql);
      expect(values).toEqual([updatedAccessTokenTtl, id]);

      return createMockQueryResult([{ ...mockResource, accessTokenTtl: updatedAccessTokenTtl }]);
    });

    await updateResourceById(id, { accessTokenTtl: updatedAccessTokenTtl });

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectFindProjectionSql.sql);
      expect(values).toEqual([mockResource.indicator]);

      return createMockQueryResult([
        {
          indicator: mockResource.indicator,
          accessTokenTtl: updatedAccessTokenTtl,
        },
      ]);
    });

    await expect(findResourceForOidcByIndicator(mockResource.indicator)).resolves.toEqual({
      indicator: mockResource.indicator,
      accessTokenTtl: updatedAccessTokenTtl,
    });
  });

  it('deleteResourceById', async () => {
    const id = 'foo';
    const expectFindByIdSql = sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.id}=$1
    `;
    const expectSql = sql`
      delete from ${table}
      where ${fields.id}=$1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectFindByIdSql.sql);
      expect(values).toEqual([id]);

      return createMockQueryResult([mockResource]);
    });

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([id]);

      return createMockQueryResult([mockResource]);
    });

    await deleteResourceById(id);
  });

  it('deleteResourceById invalidates cached resource projection', async () => {
    const { id } = mockResource;
    const expectFindProjectionSql = sql`
      select ${sql.join([fields.indicator, fields.accessTokenTtl], sql`, `)}
      from ${table}
      where ${fields.indicator}=$1
    `;
    const expectFindByIdSql = sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.id}=$1
    `;
    const expectDeleteSql = sql`
      delete from ${table}
      where ${fields.id}=$1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectFindProjectionSql.sql);
      expect(values).toEqual([mockResource.indicator]);

      return createMockQueryResult([
        {
          indicator: mockResource.indicator,
          accessTokenTtl: mockResource.accessTokenTtl,
        },
      ]);
    });

    await findResourceForOidcByIndicator(mockResource.indicator);

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectFindByIdSql.sql);
      expect(values).toEqual([id]);

      return createMockQueryResult([mockResource]);
    });

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectDeleteSql.sql);
      expect(values).toEqual([id]);

      return createMockQueryResult([mockResource]);
    });

    await deleteResourceById(id);

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectFindProjectionSql.sql);
      expect(values).toEqual([mockResource.indicator]);

      return createMockQueryResult([]);
    });

    await expect(findResourceForOidcByIndicator(mockResource.indicator)).resolves.toBeNull();
  });

  it('deleteResourceById throw error if the resource does not exist', async () => {
    const id = 'foo';

    mockQuery.mockImplementationOnce(async () => {
      return createMockQueryResult([]);
    });

    await expect(deleteResourceById(id)).rejects.toMatchError(
      new RequestError({
        code: 'entity.not_exists_with_id',
        name: Resources.table,
        id,
        status: 404,
      })
    );
  });
});
