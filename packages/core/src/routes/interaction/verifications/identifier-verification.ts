import type { Provider } from 'oidc-provider';

import type { InteractionContext, Identifier } from '../types/index.js';
import { isPasscodeIdentifier, isPasswordIdentifier, isProfileIdentifier } from '../utils/index.js';
import { verifyIdentifierByPasscode } from '../utils/passcode-validation.js';
import { verifySocialIdentity } from '../utils/social-verification.js';
import {
  verifyUserByIdentityAndPassword,
  verifyUserByVerifiedPasscodeIdentity,
  verifyUserBySocialIdentity,
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

  if (isPasscodeIdentifier(identifier)) {
    const { jti } = await provider.interactionDetails(ctx.req, ctx.res);

    await verifyIdentifierByPasscode({ ...identifier, event }, jti, ctx.log);

    const verifiedPasscodeIdentifier: Identifier =
      'email' in identifier
        ? { key: 'verifiedEmail', value: identifier.email }
        : { key: 'verifiedPhone', value: identifier.phone };

    // Return the verified identity directly if it is new profile identities
    if (isProfileIdentifier(identifier, profile)) {
      return [verifiedPasscodeIdentifier];
    }

    // Find userAccount and return
    const accountId = await verifyUserByVerifiedPasscodeIdentity(identifier);

    return [{ key: 'accountId', value: accountId }, verifiedPasscodeIdentifier];
  }

  // Social Identifier
  const socialUserInfo = await verifySocialIdentity(identifier, ctx.log);

  const { connectorId } = identifier;

  if (isProfileIdentifier(identifier, profile)) {
    return [{ key: 'social', connectorId, value: socialUserInfo }];
  }

  const accountId = await verifyUserBySocialIdentity(connectorId, socialUserInfo);

  return [
    { key: 'accountId', value: accountId },
    { key: 'social', connectorId, value: socialUserInfo },
  ];
}
