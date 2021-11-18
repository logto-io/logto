import { createMockPool, createMockQueryResult, QueryResultRowType, sql } from 'slonik';
import { PrimitiveValueExpressionType } from 'slonik/dist/src/types.d';

import pool from '@/database/pool';
import { Table } from '@/database/types';
import { convertToIdentifiers } from '@/database/utils';

export const createTestPool = <T extends QueryResultRowType>(
  expectSql?: string,
  returning?: T | ((sql: string, values: readonly PrimitiveValueExpressionType[]) => T)
) =>
  createMockPool({
    query: async (sql, values) => {
      if (expectSql) {
        expect(
          sql
            .split('\n')
            .map((row) => row.trim())
            .filter((row) => row)
        ).toEqual(expectSql.split('\n'));
      }

      return createMockQueryResult(
        returning ? [typeof returning === 'function' ? returning(sql, values) : returning] : []
      );
    },
  });

export const createTestTable = async <T extends Table>(parent: T) => {
  const { table } = convertToIdentifiers(parent);

  await pool.query(sql`create temp table ${table} (like ${table})`);
  const rows = await pool.any(sql`select * from ${table}`);
  expect(rows.length).toBe(0);
};
