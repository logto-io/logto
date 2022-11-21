import { Connectors } from '@logto/schemas';
import { convertToIdentifiers } from '@logto/shared';
import { createMockPool, createMockQueryResult, sql } from 'slonik';

import { mockConnector } from '#src/__mocks__/index.js';
import envSet from '#src/env-set/index.js';
import type { QueryType } from '#src/utils/test-utils.js';
import { expectSqlAssert } from '#src/utils/test-utils.js';

import {
  findAllConnectors,
  countConnectorByConnectorId,
  deleteConnectorById,
  insertConnector,
  updateConnector,
} from './connector.js';

const mockQuery: jest.MockedFunction<QueryType> = jest.fn();

jest.spyOn(envSet, 'pool', 'get').mockReturnValue(
  createMockPool({
    query: async (sql, values) => {
      return mockQuery(sql, values);
    },
  })
);

describe('connector queries', () => {
  const { table, fields } = convertToIdentifiers(Connectors);

  it('findAllConnectors', async () => {
    const rowData = { id: 'foo' };
    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      order by ${fields.enabled} desc, ${fields.id} asc
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([]);

      return createMockQueryResult([rowData]);
    });

    await expect(findAllConnectors()).resolves.toEqual([rowData]);
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

  it('insertConnector', async () => {
    const connector = {
      ...mockConnector,
      config: JSON.stringify(mockConnector.config),
      metadata: JSON.stringify(mockConnector.metadata),
    };

    const expectSql = `
      insert into "connectors" ("id", "enabled", "sync_profile", "connector_id", "config", "metadata")
      values ($1, $2, $3, $4, $5, $6)
      returning *
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql);

      expect(values).toEqual([
        connector.id,
        connector.enabled,
        connector.syncProfile,
        connector.connectorId,
        connector.config,
        connector.metadata,
      ]);

      return createMockQueryResult([connector]);
    });

    await expect(insertConnector(mockConnector)).resolves.toEqual(connector);
  });

  it('updateConnector (with id)', async () => {
    const id = 'foo';
    const enabled = false;

    const expectSql = sql`
      update ${table}
      set ${fields.enabled}=$1
      where ${fields.id}=$2
      returning *
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([enabled, id]);

      return createMockQueryResult([{ id, enabled }]);
    });

    await expect(
      updateConnector({ where: { id }, set: { enabled }, jsonbMode: 'merge' })
    ).resolves.toEqual({
      id,
      enabled,
    });
  });
});
