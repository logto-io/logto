import type { SignInIdentifier, User } from '@logto/schemas';
import type { Nullable } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';
import { verifyUserPassword } from '#src/lib/user.js';
import assertThat from '#src/utils/assert-that.js';

import type { InteractionContext } from '../types/index.js';

type Parameters = {
  identifier: string;
  password: string;
  findUser: (identifier: string) => Promise<Nullable<User>>;
  identifierType: SignInIdentifier;
};

export default async function verifyUserByPassword(
  ctx: InteractionContext,
  { identifier, password, findUser, identifierType }: Parameters
) {
  const { signIn } = ctx.signInExperience;

  assertThat(
    signIn.methods.some(
      ({ identifier: method, password }) => method === identifierType && password
    ),
    new RequestError({
      code: 'user.sign_in_method_not_enabled',
      status: 422,
    })
  );

  const user = await findUser(identifier);
  const verifiedUser = await verifyUserPassword(user, password);
  const { isSuspended, id } = verifiedUser;
  assertThat(!isSuspended, new RequestError({ code: 'user.suspended', status: 401 }));

  return id;
}
