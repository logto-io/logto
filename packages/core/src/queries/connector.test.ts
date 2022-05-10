import { Connectors } from '@logto/schemas';
import { createMockPool, createMockQueryResult, sql } from 'slonik';

import { mockConnector } from '@/__mocks__';
import { convertToIdentifiers } from '@/database/utils';
import envSet from '@/env-set';
import { expectSqlAssert, QueryType } from '@/utils/test-utils';

import {
  findAllConnectors,
  findConnectorById,
  findConnectorByTargetAndPlatform,
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

  it('findConnectorByTargetAndPlatform (platform is of ConnectorPlatform type)', async () => {
    const target = 'foo';
    const platform = 'Web';
    const rowData = { target, platform };

    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.target}=$1 and ${fields.platform}=$2
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([target, platform]);

      return createMockQueryResult([rowData]);
    });

    await expect(findConnectorByTargetAndPlatform(target, platform)).resolves.toEqual(rowData);
  });

  it('findConnectorByTargetAndPlatform (platform is null)', async () => {
    const target = 'foo';
    const platform = null;
    const rowData = { target, platform: null };

    const expectSql = sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.target}=$1 and ${fields.platform} is null
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([target]);

      return createMockQueryResult([rowData]);
    });

    await expect(findConnectorByTargetAndPlatform(target, platform)).resolves.toEqual(rowData);
  });

  it('insertConnector', async () => {
    const connector = {
      ...mockConnector,
      config: JSON.stringify(mockConnector.config),
    };

    const expectSql = `
      insert into "connectors" ("id", "target", "platform", "enabled", "config")
      values ($1, $2, $3, $4, $5)
      returning *
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql);

      expect(values).toEqual([
        connector.id,
        connector.target,
        connector.platform,
        connector.enabled,
        connector.config,
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

    await expect(updateConnector({ where: { id }, set: { enabled } })).resolves.toEqual({
      id,
      enabled,
    });
  });

  it('updateConnector (with target and not-null platform)', async () => {
    const target = 'foo';
    const platform = 'Web';
    const enabled = false;
    const rowData = { target, platform, enabled };

    const expectSql = sql`
      update ${table}
      set ${fields.enabled}=$1
      where ${fields.target}=$2 and ${fields.platform}=$3
      returning *
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([enabled, target, platform]);

      return createMockQueryResult([rowData]);
    });

    await expect(
      updateConnector({ set: { enabled }, where: { target, platform } })
    ).resolves.toEqual({
      target,
      platform,
      enabled,
    });
  });

  it('updateConnector (with target and null platform)', async () => {
    const target = 'foo';
    const platform = null;
    const enabled = false;
    const rowData = { target, platform: null, enabled };

    const expectSql = sql`
      update ${table}
      set ${fields.enabled}=$1
      where ${fields.target}=$2 and ${fields.platform} is null
      returning *
    `;

    mockQuery.mockImplementationOnce(async (sql, values) => {
      expectSqlAssert(sql, expectSql.sql);
      expect(values).toEqual([enabled, target]);

      return createMockQueryResult([rowData]);
    });

    await expect(
      updateConnector({ set: { enabled }, where: { target, platform } })
    ).resolves.toEqual(rowData);
  });
});
