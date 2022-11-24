import { SignInIdentifier } from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
import { findUserByEmail, findUserByPhone, findUserByUsername } from '#src/queries/user.js';

import { isUsernamePassword, isPhonePassword, isEmailPassword } from '../types/guard.js';
import type { InteractionContext, Identifier } from '../types/index.js';
import { verifyUserByPassword } from '../utils/index.js';

export default async function identifierVerification(
  ctx: InteractionContext
): Promise<Identifier[]> {
  const { identifier } = ctx.interactionPayload;

  if (isUsernamePassword(identifier)) {
    const { username, password } = identifier;

    const accountId = await verifyUserByPassword(ctx, {
      identifier: username,
      password,
      findUser: findUserByUsername,
      identifierType: SignInIdentifier.Username,
    });

    return [{ key: 'accountId', value: accountId }];
  }

  if (isPhonePassword(identifier)) {
    const { phone, password } = identifier;

    const accountId = await verifyUserByPassword(ctx, {
      identifier: phone,
      password,
      findUser: findUserByPhone,
      identifierType: SignInIdentifier.Sms,
    });

    return [{ key: 'accountId', value: accountId }];
  }

  if (isEmailPassword(identifier)) {
    const { email, password } = identifier;

    const accountId = await verifyUserByPassword(ctx, {
      identifier: email,
      password,
      findUser: findUserByEmail,
      identifierType: SignInIdentifier.Email,
    });

    return [{ key: 'accountId', value: accountId }];
  }

  // Invalid identifier input
  throw new RequestError('guard.invalid_input', identifier);
}
