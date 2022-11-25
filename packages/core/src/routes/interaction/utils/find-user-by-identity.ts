import { findUserByEmail, findUserByUsername, findUserByPhone } from '#src/queries/user.js';

import type { UserIdentity } from '../types/guard.js';

export default async function findUserByIdentity(identity: UserIdentity) {
  if ('username' in identity) {
    return findUserByUsername(identity.username);
  }

  if ('email' in identity) {
    return findUserByEmail(identity.email);
  }

  if ('phone' in identity) {
    return findUserByPhone(identity.phone);
  }

  return null;
}
