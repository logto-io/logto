import type Queries from '#src/tenants/Queries.js';

type IdentifierPayload = {
  type: 'username' | 'email' | 'phone';
  value: string;
};

export const findUserByIdentifier = async (
  userQuery: Queries['users'],
  { type, value }: IdentifierPayload
) => {
  if (type === 'username') {
    return userQuery.findUserByUsername(value);
  }

  if (type === 'email') {
    return userQuery.findUserByEmail(value);
  }

  return userQuery.findUserByPhone(value);
};
