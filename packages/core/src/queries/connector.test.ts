import { Connectors } from '@logto/schemas';
import { createMockPool, createMockQueryResult, sql } from '@silverhand/slonik';

import { mockConnector } from '#src/__mocks__/index.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';
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

const { createConnectorQueries } = await import('./connector.js');
const {
  findAllConnectors,
  findConnectorById,
  countConnectorByConnectorId,
  deleteConnectorById,
  deleteConnectorByIds,
  insertConnector,
  updateConnector,
} = createConnectorQueries(pool, new MockWellKnownCache());

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
    };

    const expectSql = `
      insert into "connectors" ("id", "sync_profile", "connector_id", "config", "metadata")
      values ($1, $2, $3, $4, $5)
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
