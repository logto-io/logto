/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @silverhand/fp/no-mutating-methods */

import { Users, UsersRoles } from '@logto/schemas';
import { sql, type DatabaseTransactionConnection } from '@silverhand/slonik';

import { type UserSeeder } from './ogcio-seeder.js';
import { createOrUpdateItem } from './queries.js';

export const seedUsers = async (params: {
  transaction: DatabaseTransactionConnection;
  tenantId: string;
  usersToSeed: UserSeeder[];
}) => {
  if (params.usersToSeed.length === 0) {
    return {};
  }

  const queries: Array<Promise<void>> = [];

  for (const user of params.usersToSeed) {
    queries.push(createUser({ ...params, userToSeed: user }));
  }

  await Promise.all(queries);

  return params.usersToSeed;
};

const createUser = async (params: {
  transaction: DatabaseTransactionConnection;
  tenantId: string;
  userToSeed: UserSeeder;
}): Promise<void> => {
  await createOrUpdateItem({
    transaction: params.transaction,
    tenantId: params.tenantId,
    toLogFieldName: 'id',
    whereClauses: [sql`tenant_id = ${params.tenantId}`, sql`id = ${params.userToSeed.id}`],
    toInsert: {
      id: params.userToSeed.id,
      username: params.userToSeed.username,
      primary_email: params.userToSeed.primary_email,
      primary_phone: params.userToSeed.primary_phone ?? undefined,
      name: params.userToSeed.name,
      application_id: params.userToSeed.application_id,
    },
    tableName: Users.table,
  });

  const assignRoleQueries = [];
  for (const roleId of params.userToSeed.resource_role_ids) {
    assignRoleQueries.push(
      createOrUpdateItem({
        transaction: params.transaction,
        tenantId: params.tenantId,
        toLogFieldName: 'role_id',
        whereClauses: [
          sql`tenant_id = ${params.tenantId}`,
          sql`user_id = ${params.userToSeed.id}`,
          sql`role_id = ${roleId}`,
        ],
        toInsert: {
          user_id: params.userToSeed.id,
          role_id: roleId,
        },
        tableName: UsersRoles.table,
      })
    );
  }

  await Promise.all(assignRoleQueries);
};
