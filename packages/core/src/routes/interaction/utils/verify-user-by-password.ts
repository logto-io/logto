import type { User } from '@logto/schemas';
import type { Nullable } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';
import { verifyUserPassword } from '#src/lib/user.js';
import assertThat from '#src/utils/assert-that.js';

export default async function verifyUserByPassword(
  identifier: string,
  password: string,
  findUser: (identifier: string) => Promise<Nullable<User>>
) {
  const user = await findUser(identifier);
  const verifiedUser = await verifyUserPassword(user, password);
  const { isSuspended, id } = verifiedUser;
  assertThat(!isSuspended, new RequestError({ code: 'user.suspended', status: 401 }));

  return id;
}
