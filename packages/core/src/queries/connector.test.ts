import { Connectors, ConnectorType, CreateConnector } from '@logto/schemas';
import { createMockPool, createMockQueryResult, sql, QueryResultRow } from 'slonik';

import { convertToIdentifiers } from '@/database/utils';
import envSet from '@/env-set';
import { expectSqlAssert, QueryType } from '@/utils/test-utils';

import {
  findAllConnectors,
  findConnectorById,
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

  it('insertConnector', async () => {
    const connector: CreateConnector & QueryResultRow = {
      id: 'foo',
      type: ConnectorType.Social,
      enabled: true,
    };

    const expectSql = `
      insert into "connectors" ("id", "type", "enabled")
      values ($1, $2, $3)
      returning *
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql);

      expect(values).toEqual([connector.id, connector.type, connector.enabled]);

      return createMockQueryResult([connector]);
    });

    await expect(insertConnector(connector)).resolves.toEqual(connector);
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
