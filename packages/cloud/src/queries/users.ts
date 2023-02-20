import type { UsersRole } from '@logto/schemas';
import type { PostgreSql } from '@withtyped/postgres';
import type { Queryable } from '@withtyped/server';

import { insertInto } from '#src/utils/query.js';

export type UsersQueries = ReturnType<typeof createUsersQueries>;

export const createUsersQueries = (client: Queryable<PostgreSql>) => {
  const assignRoleToUser = async (data: UsersRole) => client.query(insertInto(data, 'users_roles'));

  return { assignRoleToUser };
};
