import { type InteractionIdentifier } from '@logto/schemas';

import type Queries from '#src/tenants/Queries.js';

export const findUserByIdentifier = async (
  userQuery: Queries['users'],
  { type, value }: InteractionIdentifier
) => {
  if (type === 'username') {
    return userQuery.findUserByUsername(value);
  }

  if (type === 'email') {
    return userQuery.findUserByEmail(value);
  }

  return userQuery.findUserByPhone(value);
};
