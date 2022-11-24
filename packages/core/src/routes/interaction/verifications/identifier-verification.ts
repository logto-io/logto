import RequestError from '#src/errors/RequestError/index.js';
import { findUserByEmail, findUserByPhone, findUserByUsername } from '#src/queries/user.js';

import type { InteractionContext, Identifier } from '../types/index.js';
import { verifyUserByPassword } from '../utils/index.js';

export default async function identifierVerification(
  ctx: InteractionContext
): Promise<Identifier[]> {
  const { identifier } = ctx.interactionPayload;

  if (!identifier) {
    return [];
  }

  if ('username' in identifier) {
    const { username, password } = identifier;

    const accountId = await verifyUserByPassword(username, password, findUserByUsername);

    return [{ key: 'accountId', value: accountId }];
  }

  if ('phone' in identifier && 'password' in identifier) {
    const { phone, password } = identifier;

    const accountId = await verifyUserByPassword(phone, password, findUserByPhone);

    return [{ key: 'accountId', value: accountId }];
  }

  if ('email' in identifier && 'password' in identifier) {
    const { email, password } = identifier;

    const accountId = await verifyUserByPassword(email, password, findUserByEmail);

    return [{ key: 'accountId', value: accountId }];
  }

  // Invalid identifier input
  throw new RequestError('guard.invalid_input', identifier);
}
