import { type DirectIdentifier } from '@logto/schemas';

import type Queries from '#src/tenants/Queries.js';

export const findUserByIdentifier = async (
  userQuery: Queries['users'],
  { type, value }: DirectIdentifier
) => {
  if (type === 'username') {
    return userQuery.findUserByUsername(value);
  }

  if (type === 'email') {
    return userQuery.findUserByEmail(value);
  }

  return userQuery.findUserByPhone(value);
};

/** Narrow down the DirectIdentifier input to VerificationCodeIdentifier */
// export const isVerificationCodeIdentifier = (
//   identifier: DirectIdentifier
// ): identifier is VerificationCodeIdentifier => {
//   return identifier.type !== 'username';
// };
