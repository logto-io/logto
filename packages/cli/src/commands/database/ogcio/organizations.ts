/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @silverhand/fp/no-mutation */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  type AdminConsoleData,
  LogtoTenantConfigKey,
  type CreateLogtoConfig,
  defaultTenantId,
  LogtoConfigs,
} from '@logto/schemas';
import { type DatabaseTransactionConnection, sql } from '@silverhand/slonik';

import { insertInto } from '../../../database.js';
import { consoleLog } from '../../../utils.js';

import { createItem, getInsertedColumnValue, updateQuery } from './queries.js';

const createAdminConsoleConfig = (
  forTenantId: string
): Readonly<{
  tenantId: string;
  key: LogtoTenantConfigKey;
  value: AdminConsoleData;
}> =>
  Object.freeze({
    tenantId: forTenantId,
    key: LogtoTenantConfigKey.AdminConsole,
    value: {
      signInExperienceCustomized: false,
      organizationCreated: true,
    },
  } satisfies CreateLogtoConfig);

const updateTenantConfigs = async (
  transaction: DatabaseTransactionConnection,
  tenantId: string
): Promise<void> => {
  consoleLog.info(`Updating ${LogtoConfigs.table} for tenant id ${tenantId}`);
  const currentValue = await getInsertedColumnValue({
    transaction,
    tenantId,
    whereClauses: [sql`key = ${LogtoTenantConfigKey.AdminConsole}`],
    tableName: LogtoConfigs.table,
    columnToGet: 'value',
  });

  if (currentValue === undefined) {
    await transaction.query(
      insertInto(createAdminConsoleConfig(defaultTenantId), LogtoConfigs.table)
    );
    return;
  }

  const jsonValue = typeof currentValue === 'string' ? JSON.parse(currentValue) : currentValue;
  jsonValue.organizationCreated = true;
  const updateQueryString = updateQuery(
    [sql`value = ${JSON.stringify(jsonValue)}`],
    [sql`key = ${LogtoTenantConfigKey.AdminConsole}`, sql`tenant_id = ${tenantId}`],
    LogtoConfigs.table
  );

  await transaction.query(updateQueryString);

  consoleLog.info(`Updated ${LogtoConfigs.table} for tenant id ${tenantId}`);
};

export const createOrganization = async (
  transaction: DatabaseTransactionConnection,
  tenantId: string
) => {
  const toInsert = { name: 'OGCIO Seeded Org', description: 'Organization created through seeder' };
  const organization = createItem({
    transaction,
    tenantId,
    toInsert,
    whereClauses: [sql`name = ${toInsert.name}`],
    toLogFieldName: 'name',
    tableName: 'organizations',
    itemTypeName: 'Organization',
  });

  await updateTenantConfigs(transaction, tenantId);

  return organization;
};
