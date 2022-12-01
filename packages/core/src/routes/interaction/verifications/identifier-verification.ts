import type { Profile, SocialConnectorPayload } from '@logto/schemas';
import { Event } from '@logto/schemas';
import type { Provider } from 'oidc-provider';

import RequestError from '#src/errors/RequestError/index.js';
import { findSocialRelatedUser } from '#src/lib/social.js';
import { verifyUserPassword } from '#src/lib/user.js';
import { maskUserInfo } from '#src/utils/format.js';

import type {
  PasswordIdentifierPayload,
  PasscodeIdentifierPayload,
  InteractionContext,
  Identifier,
  SocialIdentifier,
} from '../types/index.js';
import findUserByIdentifier from '../utils/find-user-by-identifier.js';
import { isPasscodeIdentifier, isPasswordIdentifier, isProfileIdentifier } from '../utils/index.js';
import { verifyIdentifierByPasscode } from '../utils/passcode-validation.js';
import { verifySocialIdentity } from '../utils/social-verification.js';

type ReturnResult = {
  error?: RequestError;
  verifiedIdentifiers?: Identifier[];
};

const passwordIdentifierVerification = async (
  identifier: PasswordIdentifierPayload
): Promise<ReturnResult> => {
  // TODO: Log
  const { password, ...identity } = identifier;
  const user = await findUserByIdentifier(identity);
  const verifiedUser = await verifyUserPassword(user, password);

  const { isSuspended, id } = verifiedUser;

  if (isSuspended) {
    return { error: new RequestError({ code: 'user.suspended', status: 401 }) };
  }

  return { verifiedIdentifiers: [{ key: 'accountId', value: id }] };
};

const passcodeIdentifierVerification = async (
  payload: { event: Event; identifier: PasscodeIdentifierPayload; profile?: Profile },
  ctx: InteractionContext,
  provider: Provider
): Promise<ReturnResult> => {
  const { identifier, event, profile } = payload;
  const { jti } = await provider.interactionDetails(ctx.req, ctx.res);

  await verifyIdentifierByPasscode({ ...identifier, event }, jti, ctx.log);

  const verifiedPasscodeIdentifier: Identifier =
    'email' in identifier
      ? { key: 'emailVerified', value: identifier.email }
      : { key: 'phoneVerified', value: identifier.phone };

  // Return the verified identity directly if it is for new profile identity verification
  if (isProfileIdentifier(identifier, profile)) {
    return { verifiedIdentifiers: [verifiedPasscodeIdentifier] };
  }

  const user = await findUserByIdentifier(identifier);

  if (!user) {
    return {
      error: new RequestError({ code: 'user.user_not_exist', status: 404 }),
      verifiedIdentifiers:
        event === Event.ForgotPassword ? undefined : [verifiedPasscodeIdentifier],
    };
  }

  const { id, isSuspended } = user;

  if (isSuspended) {
    return {
      error: new RequestError({ code: 'user.suspended', status: 401 }),
    };
  }

  return {
    verifiedIdentifiers: [{ key: 'accountId', value: id }, verifiedPasscodeIdentifier],
  };
};

const socialIdentifierVerification = async (
  payload: { identifier: SocialConnectorPayload; profile?: Profile },
  ctx: InteractionContext
): Promise<ReturnResult> => {
  const { identifier, profile } = payload;
  const userInfo = await verifySocialIdentity(identifier, ctx.log);

  const { connectorId } = identifier;
  const socialIdentifier: SocialIdentifier = { key: 'social', connectorId, value: userInfo };

  // Return the verified identity directly if it is for new profile identity verification
  if (isProfileIdentifier(identifier, profile)) {
    return { verifiedIdentifiers: [socialIdentifier] };
  }

  const user = await findUserByIdentifier({ connectorId, userInfo });

  if (!user) {
    const relatedInfo = await findSocialRelatedUser(userInfo);

    return {
      error: new RequestError(
        {
          code: 'user.identity_not_exists',
          status: 422,
        },
        relatedInfo && { relatedUser: maskUserInfo(relatedInfo[0]) }
      ),
      verifiedIdentifiers: [socialIdentifier],
    };
  }

  const { id, isSuspended } = user;

  if (isSuspended) {
    return { error: new RequestError({ code: 'user.suspended', status: 401 }) };
  }

  return {
    verifiedIdentifiers: [
      { key: 'accountId', value: id },
      { key: 'social', connectorId, value: userInfo },
    ],
  };
};

export default async function identifierVerification(
  ctx: InteractionContext,
  provider: Provider
): Promise<ReturnResult> {
  const { identifier, event, profile } = ctx.interactionPayload;

  if (!identifier) {
    return {};
  }

  if (isPasswordIdentifier(identifier)) {
    return passwordIdentifierVerification(identifier);
  }

  if (isPasscodeIdentifier(identifier)) {
    return passcodeIdentifierVerification({ identifier, event, profile }, ctx, provider);
  }

  // Social Identifier
  return socialIdentifierVerification({ identifier, profile }, ctx);
}
