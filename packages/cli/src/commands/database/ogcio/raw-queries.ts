/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @silverhand/fp/no-mutating-methods */

import { sql, type DatabaseTransactionConnection } from '@silverhand/slonik';

import { consoleLog } from '../../../utils.js';

import { type RawQuerySeeder } from './ogcio-seeder.js';

export const executeRawQueries = async (params: {
  transaction: DatabaseTransactionConnection;
  rawQueries: RawQuerySeeder[];
}) => {
  if (params.rawQueries.length === 0) {
    return;
  }

  const queries: Array<Promise<void>> = [];
  for (const rawQuery of params.rawQueries) {
    queries.push(executeQuery({ ...params, queryToRun: rawQuery }));
  }

  await Promise.all(queries);
};

const executeQuery = async (params: {
  transaction: DatabaseTransactionConnection;
  queryToRun: RawQuerySeeder;
}): Promise<void> => {
  consoleLog.info(`Going to run ${params.queryToRun.name} query.`);
  const querySanitized = sql.raw(params.queryToRun.query);
  await params.transaction.query(querySanitized);
  consoleLog.info(`
    ${params.queryToRun.name} query executed!`);
};
