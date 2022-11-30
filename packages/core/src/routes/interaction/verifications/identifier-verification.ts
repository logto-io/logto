import type { Profile, SocialConnectorPayload } from '@logto/schemas';
import { Event } from '@logto/schemas';
import type { Provider } from 'oidc-provider';

import RequestError from '#src/errors/RequestError/index.js';
import { findSocialRelatedUser } from '#src/lib/social.js';
import { verifyUserPassword } from '#src/lib/user.js';
import assertThat from '#src/utils/assert-that.js';
import { maskUserInfo } from '#src/utils/format.js';

import type { PasswordIdentifierPayload, PasscodeIdentifierPayload } from '../types/guard.js';
import type { InteractionContext, Identifier, SocialIdentifier } from '../types/index.js';
import findUserByIdentifier from '../utils/find-user-by-identifier.js';
import { isPasscodeIdentifier, isPasswordIdentifier, isProfileIdentifier } from '../utils/index.js';
import { assignIdentifierVerificationResult } from '../utils/interaction.js';
import { verifyIdentifierByPasscode } from '../utils/passcode-validation.js';
import { verifySocialIdentity } from '../utils/social-verification.js';

const passwordIdentifierVerification = async (
  identifier: PasswordIdentifierPayload
): Promise<Identifier[]> => {
  // TODO: Log
  const { password, ...identity } = identifier;
  const user = await findUserByIdentifier(identity);
  const verifiedUser = await verifyUserPassword(user, password);

  const { isSuspended, id } = verifiedUser;
  assertThat(!isSuspended, new RequestError({ code: 'user.suspended', status: 401 }));

  return [{ key: 'accountId', value: id }];
};

const passcodeIdentifierVerification = async (
  payload: { event: Event; identifier: PasscodeIdentifierPayload; profile?: Profile },
  ctx: InteractionContext,
  provider: Provider
): Promise<Identifier[]> => {
  const { identifier, event, profile } = payload;
  const { jti } = await provider.interactionDetails(ctx.req, ctx.res);

  await verifyIdentifierByPasscode({ ...identifier, event }, jti, ctx.log);

  const verifiedPasscodeIdentifier: Identifier =
    'email' in identifier
      ? { key: 'verifiedEmail', value: identifier.email }
      : { key: 'verifiedPhone', value: identifier.phone };

  // Return the verified identity directly if it is for new profile identity verification
  if (isProfileIdentifier(identifier, profile)) {
    return [verifiedPasscodeIdentifier];
  }

  const user = await findUserByIdentifier(identifier);

  if (!user) {
    // Throw verification result and assign verified identifiers
    if (event !== Event.ForgotPassword) {
      await assignIdentifierVerificationResult(
        { event, identifiers: [verifiedPasscodeIdentifier] },
        ctx,
        provider
      );
    }

    throw new RequestError({ code: 'user.user_not_exist', status: 404 });
  }

  const { id, isSuspended } = user;
  assertThat(!isSuspended, new RequestError({ code: 'user.suspended', status: 401 }));

  return [{ key: 'accountId', value: id }, verifiedPasscodeIdentifier];
};

const socialIdentifierVerification = async (
  payload: { event: Event; identifier: SocialConnectorPayload; profile?: Profile },
  ctx: InteractionContext,
  provider: Provider
): Promise<Identifier[]> => {
  const { event, identifier, profile } = payload;
  const userInfo = await verifySocialIdentity(identifier, ctx.log);

  const { connectorId } = identifier;
  const socialIdentifier: SocialIdentifier = { key: 'social', connectorId, value: userInfo };

  // Return the verified identity directly if it is for new profile identity verification
  if (isProfileIdentifier(identifier, profile)) {
    return [socialIdentifier];
  }

  const user = await findUserByIdentifier({ connectorId, userInfo });

  if (!user) {
    // Throw verification result and assign verified identifiers
    await assignIdentifierVerificationResult(
      { event, identifiers: [socialIdentifier] },
      ctx,
      provider
    );

    const relatedInfo = await findSocialRelatedUser(userInfo);

    throw new RequestError(
      {
        code: 'user.identity_not_exists',
        status: 422,
      },
      relatedInfo && { relatedUser: maskUserInfo(relatedInfo[0]) }
    );
  }

  const { id, isSuspended } = user;
  assertThat(!isSuspended, new RequestError({ code: 'user.suspended', status: 401 }));

  return [
    { key: 'accountId', value: id },
    { key: 'social', connectorId, value: userInfo },
  ];
};

export default async function identifierVerification(
  ctx: InteractionContext,
  provider: Provider
): Promise<Identifier[]> {
  const { identifier, event, profile } = ctx.interactionPayload;

  if (!identifier) {
    return [];
  }

  if (isPasswordIdentifier(identifier)) {
    return passwordIdentifierVerification(identifier);
  }

  if (isPasscodeIdentifier(identifier)) {
    return passcodeIdentifierVerification({ identifier, event, profile }, ctx, provider);
  }

  // Social Identifier
  return socialIdentifierVerification({ event, identifier, profile }, ctx, provider);
}
