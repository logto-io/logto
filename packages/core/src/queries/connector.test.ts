import { Connectors, CreateConnector } from '@logto/schemas';
import { createMockPool, createMockQueryResult, sql, QueryResultRowType } from 'slonik';

import { convertToIdentifiers } from '@/database/utils';
import { expectSqlAssert, QueryType } from '@/utils/test-utils';

import {
  findAllConnectors,
  findConnectorById,
  hasConnector,
  insertConnector,
  updateConnector,
} from './connector';

const mockQuery: jest.MockedFunction<QueryType> = jest.fn();

jest.mock('@/database/pool', () =>
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

  it('hasConnector', async () => {
    const id = 'foo';

    const expectSql = sql`
      SELECT EXISTS(
        select ${sql.join(Object.values(fields), sql`, `)}
        from ${table}
        where ${fields.id}=$1
      )
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([id]);

      return createMockQueryResult([{ exists: true }]);
    });

    await expect(hasConnector(id)).resolves.toEqual(true);
  });

  it('insertConnector', async () => {
    const connector: CreateConnector & QueryResultRowType = {
      id: 'foo',
      enabled: true,
    };

    const expectSql = `
      insert into "connectors" ("id", "enabled")
      values ($1, $2)
      returning *
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql);

      expect(values).toEqual([connector.id, connector.enabled]);

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
