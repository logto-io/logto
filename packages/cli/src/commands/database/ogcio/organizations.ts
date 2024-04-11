import { type DatabaseTransactionConnection, sql } from '@silverhand/slonik';

import { createItem } from './queries.js';

export const createOrganization = async (
  transaction: DatabaseTransactionConnection,
  tenantId: string
) => {
  const toInsert = { name: 'OGCIO Seeded Org', description: 'Organization created through seeder' };
  return createItem({
    transaction,
    tenantId,
    toInsert,
    whereClauses: [sql`name = ${toInsert.name}`],
    toLogFieldName: 'name',
    tableName: 'organizations',
    itemTypeName: 'Organization',
  });
};
