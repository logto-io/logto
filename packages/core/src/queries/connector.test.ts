import { Connectors } from '@logto/schemas';
import { createMockPool, createMockQueryResult, sql } from 'slonik';

import { mockConnector } from '@/__mocks__';
import { convertToIdentifiers } from '@/database/utils';
import envSet from '@/env-set';
import { expectSqlAssert, QueryType } from '@/utils/test-utils';

import {
  findAllConnectors,
  findConnectorById,
  hasConnectorWithId,
  insertConnector,
  updateConnector,
} from './connector';

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

  it('findConnectorById', async () => {
    const id = 'foo';
    const rowData = { id };

    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.id}=$1
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([id]);

      return createMockQueryResult([rowData]);
    });

    await expect(findConnectorById(id)).resolves.toEqual(rowData);
  });

  it('hasConnectorWithId', async () => {
    const expectSql = sql`
      SELECT EXISTS(
        select ${fields.id}
        from ${table}
        where ${fields.id}=$1
      )
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([mockConnector.id]);

      return createMockQueryResult([{ exists: true }]);
    });

    await expect(hasConnectorWithId(mockConnector.id)).resolves.toEqual(true);
  });

  it('insertConnector', async () => {
    const connector = {
      ...mockConnector,
      config: JSON.stringify(mockConnector.config),
      metadata: JSON.stringify(mockConnector.metadata),
    };

    const expectSql = `
      insert into "connectors" ("id", "name", "platform", "type", "enabled", "config", "metadata")
      values ($1, $2, $3, $4, $5, $6, $7)
      returning *
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql);

      expect(values).toEqual([
        connector.id,
        connector.name,
        connector.platform,
        connector.type,
        connector.enabled,
        connector.config,
        connector.metadata,
      ]);

      return createMockQueryResult([connector]);
    });

    await expect(insertConnector(mockConnector)).resolves.toEqual(connector);
  });

  it('updateConnector', async () => {
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

    await expect(updateConnector({ where: { id }, set: { enabled } })).resolves.toEqual({
      id,
      enabled,
    });
  });
});
