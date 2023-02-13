// Copied from core

import type { QueryResult, QueryResultRow } from 'slonik';
import type { PrimitiveValueExpression } from 'slonik/dist/src/types.js';

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
