// Copied from core

import type { QueryResult, QueryResultRow } from '@silverhand/slonik';
import type { PrimitiveValueExpression } from '@silverhand/slonik/dist/src/types.js';
import { expect } from 'vitest';

export type QueryType = (
  sql: string,
  values: readonly PrimitiveValueExpression[]
) => Promise<QueryResult<QueryResultRow>>;

/**
 *  Slonik Query Mock Utils
 **/
export const expectSqlAssert = (sql: string, expectSql: string) => {
  expect(
    sql
      .split('\n')
      .map((row) => row.trim())
      .filter(Boolean)
  ).toEqual(
    expectSql
      .split('\n')
      .map((row) => row.trim())
      .filter(Boolean)
  );
};
