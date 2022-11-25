import type { Provider } from 'oidc-provider';

import RequestError from '#src/errors/RequestError/index.js';

import type { InteractionContext, Identifier } from '../types/index.js';
import {
  isPasscodeIdentifier,
  isPasswordIdentifier,
  isProfileIdentifier,
} from '../utils/index.ts.js';
import { verifyIdentifierByPasscode } from '../utils/passcode-validation.js';
import {
  verifyUserByIdentityAndPassword,
  verifyUserByVerifiedPasscodeIdentity,
} from '../utils/verify-user.js';

export default async function identifierVerification(
  ctx: InteractionContext,
  provider: Provider
): Promise<Identifier[]> {
  const { identifier, event, profile } = ctx.interactionPayload;

  if (!identifier) {
    return [];
  }

  if (isPasswordIdentifier(identifier)) {
    const accountId = await verifyUserByIdentityAndPassword(identifier);

    return [{ key: 'accountId', value: accountId }];
  }

  if (isPasscodeIdentifier(identifier) && event) {
    const { jti } = await provider.interactionDetails(ctx.req, ctx.res);

    await verifyIdentifierByPasscode({ ...identifier, event }, jti, ctx.log);

    const verifiedPasscodeIdentifier: Identifier =
      'email' in identifier
        ? { key: 'verifiedEmail', value: identifier.email }
        : { key: 'verifiedPhone', value: identifier.phone };

    // Return the verified identity directly if it is for new profile validation
    if (isProfileIdentifier(identifier, profile)) {
      return [verifiedPasscodeIdentifier];
    }

    // Find userAccount and return
    const accountId = await verifyUserByVerifiedPasscodeIdentity(identifier);

    return [{ key: 'accountId', value: accountId }, verifiedPasscodeIdentifier];
  }

  // Invalid identifier input
  throw new RequestError('guard.invalid_input', identifier);
}
