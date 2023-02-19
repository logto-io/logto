import type { UsersRole } from '@logto/schemas';
import type { PostgresQueryClient } from '@withtyped/postgres';

import { insertInto } from '#src/utils/query.js';

export type UsersQueries = ReturnType<typeof createUsersQueries>;

export const createUsersQueries = (client: PostgresQueryClient) => {
  const assignRoleToUser = async (data: UsersRole) => client.query(insertInto(data, 'users_roles'));

  return { assignRoleToUser };
};
