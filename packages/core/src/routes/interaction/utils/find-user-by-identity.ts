import type { User } from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
import { findUserByEmail, findUserByUsername, findUserByPhone } from '#src/queries/user.js';
import assertThat from '#src/utils/assert-that.js';

import type { UserIdentity } from '../types/guard.js';

const findUser = (identity: UserIdentity) => {
  if ('username' in identity) {
    return findUserByUsername(identity.username);
  }

  if ('email' in identity) {
    return findUserByEmail(identity.email);
  }

  if ('phone' in identity) {
    return findUserByPhone(identity.phone);
  }

  // TODO: social identity

  return null;
};

export default async function findUserByIdentity(identity: UserIdentity): Promise<User> {
  const user = await findUser(identity);
  assertThat(user, new RequestError({ code: 'user.user_not_exist', status: 404 }));

  return user;
}
