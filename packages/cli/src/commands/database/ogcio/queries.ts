/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable unicorn/prefer-string-replace-all */
/* eslint-disable @silverhand/fp/no-mutating-methods */
/* eslint-disable @silverhand/fp/no-mutation */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { generateStandardId } from '@logto/shared';
import {
  type DatabaseTransactionConnection,
  type QueryResult,
  sql,
  type ValueExpression,
} from '@silverhand/slonik';

import { insertInto } from '../../../database.js';
import { consoleLog } from '../../../utils.js';

const snakeToCamel = (input: string): string =>
  input.replace(/(?!^)_(.)/g, (_, char: string) => char.toUpperCase());

export const getColumnValueByQueryResult = <T extends Record<string, string>>(
  result: QueryResult<T>,
  columnToGet: string
): string | undefined => {
  const camelColumn = snakeToCamel(columnToGet);
  if (result.rows[0] === undefined || result.rows[0][camelColumn] === undefined) {
    return undefined;
  }

  return result.rows[0][camelColumn];
};

export const getIdByQueryResult = <T extends { id: string }>(
  result: QueryResult<T>
): string | undefined => getColumnValueByQueryResult(result, 'id');

export const getInsertedColumnValue = async (params: {
  transaction: DatabaseTransactionConnection;
  tenantId: string | undefined;
  whereClauses: ValueExpression[];
  tableName: string;
  columnToGet: string;
}): Promise<string | undefined> => {
  const { whereClauses, tenantId, tableName, columnToGet, transaction } = params;
  const cloneWhere = [...whereClauses];
  if (tenantId !== undefined) {
    cloneWhere.push(sql`tenant_id = ${tenantId}`);
  }

  const scope = await transaction.query<Record<string, string>>(sql`
    select ${sql.identifier([columnToGet])} from ${sql.identifier([tableName])}
      where ${sql.join(cloneWhere, sql` AND `)}
      limit 1
  `);

  return getColumnValueByQueryResult(scope, columnToGet);
};

export const getInsertedId = async (
  transaction: DatabaseTransactionConnection,
  tenantId: string | undefined,
  whereClauses: ValueExpression[],
  tableName: string
): Promise<string | undefined> =>
  getInsertedColumnValue({ transaction, tenantId, whereClauses, tableName, columnToGet: 'id' });

export const createItem = async <
  T extends { id?: string } & Record<string, number | string | undefined | unknown[] | boolean>,
>(params: {
  transaction: DatabaseTransactionConnection;
  tenantId?: string;
  toInsert: T;
  toLogFieldName: string;
  whereClauses: ValueExpression[];
  tableName: string;
}): Promise<Omit<T, 'id'> & { id: string }> => {
  const prefixConsoleEntry = `Table ${params.tableName}. TenantId: ${
    params.tenantId ?? 'NOT SET'
  }. ${params.toLogFieldName}: ${params.toInsert[params.toLogFieldName]!.toString()}`;
  try {
    const scopeIdBefore = await getInsertedId(
      params.transaction,
      params.tenantId,
      params.whereClauses,
      params.tableName
    );
    if (scopeIdBefore !== undefined) {
      consoleLog.info(`${prefixConsoleEntry}. Already exists.`);
      params.toInsert.id = scopeIdBefore;
      return { ...params.toInsert, id: scopeIdBefore };
    }

    const toInsertData = {
      ...params.toInsert,
      tenant_id: params.tenantId,
    };

    if (!toInsertData.id) {
      toInsertData.id = generateStandardId();
    }

    await params.transaction.query(insertInto(toInsertData, params.tableName));
    params.toInsert.id = await getInsertedId(
      params.transaction,
      params.tenantId,
      params.whereClauses,
      params.tableName
    );
    if (params.toInsert.id !== undefined) {
      consoleLog.info(`${prefixConsoleEntry}. Created, Id ${params.toInsert.id}`);
      return { ...params.toInsert, id: params.toInsert.id };
    }

    throw new Error(`${prefixConsoleEntry}. Failure inserting it!`);
  } catch (error) {
    consoleLog.error(prefixConsoleEntry);
    throw error;
  }
};

export const createItemWithoutId = async <
  T extends Record<string, number | string | undefined | unknown[] | boolean>,
>(params: {
  transaction: DatabaseTransactionConnection;
  tenantId: string | undefined;
  toInsert: T;
  toLogFieldName: string;
  whereClauses: ValueExpression[];
  tableName: string;
  columnToGet: string;
}): Promise<T> => {
  const prefixConsoleEntry = `${params.tableName}. TenantId: ${params.tenantId ?? 'NOT SET'}. ${
    params.toLogFieldName
  }: ${params.toInsert[params.toLogFieldName]!.toString()}`;
  consoleLog.info(prefixConsoleEntry);
  const scopeIdBefore = await getInsertedColumnValue(params);
  if (scopeIdBefore !== undefined) {
    consoleLog.info(`${prefixConsoleEntry}. Already exists.`);
    return { ...params.toInsert, [params.columnToGet]: scopeIdBefore };
  }

  const toInsertData = {
    tenant_id: params.tenantId,
    ...params.toInsert,
  };
  await params.transaction.query(insertInto(toInsertData, params.tableName));
  const outputValue = await getInsertedColumnValue(params);
  if (outputValue !== undefined) {
    consoleLog.info(`${prefixConsoleEntry}. Created, ${params.columnToGet} ${outputValue}`);
    return { ...params.toInsert, [params.columnToGet]: outputValue };
  }

  throw new Error(`${prefixConsoleEntry}. Failure inserting it!`);
};

export const updateQuery = (
  toSetValues: ValueExpression[],
  whereClauses: ValueExpression[],
  table: string
) => {
  return sql`
    update ${sql.identifier([table])}
    set ${sql.join(toSetValues, sql`, `)}
    where ${sql.join(whereClauses, sql` AND `)}
  `;
};
