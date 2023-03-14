import { Connectors } from '@logto/schemas';
import { convertToIdentifiers } from '@logto/shared';
import { createMockPool, createMockQueryResult, sql } from 'slonik';

import { mockConnector } from '#src/__mocks__/index.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';
import type { QueryType } from '#src/utils/test-utils.js';
import { expectSqlAssert } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const mockQuery: jest.MockedFunction<QueryType> = jest.fn();

const pool = createMockPool({
  query: async (sql, values) => {
    return mockQuery(sql, values);
  },
});

const { createConnectorQueries } = await import('./connector.js');
const {
  findAllConnectors,
  findConnectorById,
  countConnectorByConnectorId,
  setValueById,
  getValueById,
  deleteConnectorById,
  deleteConnectorByIds,
  insertConnector,
  updateConnector,
} = createConnectorQueries(pool);

describe('connector queries', () => {
  const { table, fields } = convertToIdentifiers(Connectors);

  it('findAllConnectors', async () => {
    const rowData = { id: 'foo' };
    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      order by ${fields.id} asc
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([]);

      return createMockQueryResult([rowData]);
    });

    await expect(findAllConnectors()).resolves.toEqual([rowData]);
  });

  it('findConnectorById', async () => {
    const row = {
      ...mockConnector,
      config: JSON.stringify(mockConnector.config),
      metadata: JSON.stringify(mockConnector.metadata),
      storage: JSON.stringify(mockConnector.storage),
    };
    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      where ${fields.id}=$1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([mockConnector.id]);

      return createMockQueryResult([row]);
    });

    await expect(findConnectorById(mockConnector.id)).resolves.toEqual(row);
  });

  it('countConnectorsByConnectorId', async () => {
    const rowData = { id: 'foo', connectorId: 'bar' };

    const expectSql = sql`
      select count(*)
      from ${table}
      where ${fields.connectorId}=$1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual(['bar']);

      return createMockQueryResult([rowData]);
    });

    await expect(countConnectorByConnectorId(rowData.connectorId)).resolves.toEqual(rowData);
  });

  it('setValueById', async () => {
    const id = 'foo';
    const value = {
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
      expiresIn: 5000,
      tokenType: 'Bearer',
    };
    const rowData = { id, storage: value };
    const expectSql = sql`
      update ${table}
      set
      ${fields.storage}=
      coalesce(${fields.storage},'{}'::jsonb) || ${JSON.stringify(value)}
      where ${fields.id}=$2
      returning *
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([JSON.stringify(value), id]);

      // @ts-expect-error createMockQueryResult doesn't support jsonb
      return createMockQueryResult([rowData]);
    });

    await expect(setValueById(id, value)).resolves.toEqual(undefined);
  });

  it('getValueById', async () => {
    const id = 'foo';
    const value = {
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
      expiresIn: 5000,
      tokenType: 'Bearer',
    };
    const expectSql = sql`
      select ${fields.storage} as value
      from ${table}
      where ${fields.id} = $1;
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([id]);

      // @ts-expect-error createMockQueryResult doesn't support jsonb
      return createMockQueryResult([{ value }]);
    });

    await expect(getValueById(id)).resolves.toEqual(value);
  });

  it('deleteConnectorById', async () => {
    const rowData = { id: 'foo' };
    const id = 'foo';
    const expectSql = sql`
      delete from ${table}
      where ${fields.id}=$1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([id]);

      return createMockQueryResult([rowData]);
    });

    await deleteConnectorById(id);
  });

  it('deleteConnectorById should throw with zero response', async () => {
    const id = 'foo';
    const expectSql = sql`
      delete from ${table}
      where ${fields.id}=$1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([id]);

      return createMockQueryResult([]);
    });

    await expect(deleteConnectorById(id)).rejects.toMatchError(
      new DeletionError(Connectors.table, id)
    );
  });

  it('deleteConnectorByIds', async () => {
    const rowData = [{ id: 'foo' }, { id: 'bar' }, { id: 'baz' }];
    const ids = ['foo', 'bar', 'baz'];
    const expectSql = sql`
      delete from ${table}
      where ${fields.id} in ($1, $2, $3)
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual(ids);

      return createMockQueryResult(rowData);
    });

    await deleteConnectorByIds(ids);
  });

  it('deleteConnectorByIds should throw with row count does not match length of ids', async () => {
    const ids = ['foo', 'bar', 'baz'];
    const expectSql = sql`
      delete from ${table}
      where ${fields.id} in ($1, $2, $3)
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual(ids);

      return createMockQueryResult([{ id: 'foo' }, { id: 'bar' }]);
    });

    await expect(deleteConnectorByIds(ids)).rejects.toMatchError(
      new DeletionError(Connectors.table, JSON.stringify({ ids }))
    );
  });

  it('insertConnector', async () => {
    const connector = {
      ...mockConnector,
      config: JSON.stringify(mockConnector.config),
      metadata: JSON.stringify(mockConnector.metadata),
      storage: JSON.stringify(mockConnector.storage),
    };

    const expectSql = `
      insert into "connectors" ("id", "sync_profile", "connector_id", "config", "metadata", "storage")
      values ($1, $2, $3, $4, $5, $6)
      returning *
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql);

      expect(values).toEqual([
        connector.id,
        connector.syncProfile,
        connector.connectorId,
        connector.config,
        connector.metadata,
        connector.storage,
      ]);

      return createMockQueryResult([connector]);
    });

    const { tenantId, ...data } = mockConnector;
    await expect(insertConnector(data)).resolves.toEqual(connector);
  });

  it('updateConnector (with id)', async () => {
    const id = 'foo';
    const syncProfile = false;

    const expectSql = sql`
      update ${table}
      set ${fields.syncProfile}=$1
      where ${fields.id}=$2
      returning *
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([syncProfile, id]);

      return createMockQueryResult([{ id, syncProfile }]);
    });

    await expect(
      updateConnector({ where: { id }, set: { syncProfile }, jsonbMode: 'merge' })
    ).resolves.toEqual({
      id,
      syncProfile,
    });
  });
});
