import type {
  InteractionEvent,
  IdentifierPayload,
  SocialConnectorPayload,
  SocialIdentityPayload,
} from '@logto/schemas';
import type Provider from 'oidc-provider';

import RequestError from '#src/errors/RequestError/index.js';
import { verifyUserPassword } from '#src/libraries/user.js';
import type { WithLogContext } from '#src/middleware/koa-audit-log.js';
import assertThat from '#src/utils/assert-that.js';

import type {
  PasswordIdentifierPayload,
  VerificationCodeIdentifierPayload,
  SocialIdentifier,
  VerifiedEmailIdentifier,
  VerifiedPhoneIdentifier,
  AnonymousInteractionResult,
  Identifier,
  AccountIdIdentifier,
} from '../types/index.js';
import findUserByIdentifier from '../utils/find-user-by-identifier.js';
import {
  isVerificationCodeIdentifier,
  isPasswordIdentifier,
  isSocialIdentifier,
} from '../utils/index.js';
import { verifySocialIdentity } from '../utils/social-verification.js';
import { verifyIdentifierByVerificationCode } from '../utils/verification-code-validation.js';

const verifyPasswordIdentifier = async (
  event: InteractionEvent,
  identifier: PasswordIdentifierPayload,
  ctx: WithLogContext
): Promise<AccountIdIdentifier> => {
  const { password, ...identity } = identifier;

  const log = ctx.createLog(`Interaction.${event}.Identifier.Password.Submit`);
  log.append({ ...identity });

  const user = await findUserByIdentifier(identity);
  const verifiedUser = await verifyUserPassword(user, password);

  const { isSuspended, id } = verifiedUser;

  assertThat(!isSuspended, new RequestError({ code: 'user.suspended', status: 401 }));

  return { key: 'accountId', value: id };
};

const verifyVerificationCodeIdentifier = async (
  event: InteractionEvent,
  identifier: VerificationCodeIdentifierPayload,
  ctx: WithLogContext,
  provider: Provider
): Promise<VerifiedEmailIdentifier | VerifiedPhoneIdentifier> => {
  const { jti } = await provider.interactionDetails(ctx.req, ctx.res);

  await verifyIdentifierByVerificationCode({ ...identifier, event }, jti, ctx.createLog);

  return 'email' in identifier
    ? { key: 'emailVerified', value: identifier.email }
    : { key: 'phoneVerified', value: identifier.phone };
};

const verifySocialIdentifier = async (
  identifier: SocialConnectorPayload,
  ctx: WithLogContext,
  provider: Provider
): Promise<SocialIdentifier> => {
  const userInfo = await verifySocialIdentity(identifier, ctx, provider);

  return { key: 'social', connectorId: identifier.connectorId, userInfo };
};

const verifySocialIdentityInInteractionRecord = async (
  { connectorId, identityType }: SocialIdentityPayload,
  ctx: WithLogContext,
  interactionRecord?: AnonymousInteractionResult
): Promise<VerifiedEmailIdentifier | VerifiedPhoneIdentifier> => {
  const log = ctx.createLog(`Interaction.SignIn.Identifier.Social.Submit`);
  log.append({ connectorId, identityType });

  // Sign-In with social verified email or phone requires a social identifier in the interaction result
  const socialIdentifierRecord = interactionRecord?.identifiers?.find(
    (entity): entity is SocialIdentifier =>
      entity.key === 'social' && entity.connectorId === connectorId
  );

  const verifiedSocialIdentity = socialIdentifierRecord?.userInfo[identityType];

  assertThat(verifiedSocialIdentity, new RequestError('session.connector_session_not_found'));

  return {
    key: identityType === 'email' ? 'emailVerified' : 'phoneVerified',
    value: verifiedSocialIdentity,
  };
};

export default async function identifierPayloadVerification(
  ctx: WithLogContext,
  provider: Provider,
  identifierPayload: IdentifierPayload,
  interactionStorage: AnonymousInteractionResult
): Promise<Identifier> {
  const { event } = interactionStorage;

  if (isPasswordIdentifier(identifierPayload)) {
    return verifyPasswordIdentifier(event, identifierPayload, ctx);
  }

  if (isVerificationCodeIdentifier(identifierPayload)) {
    return verifyVerificationCodeIdentifier(event, identifierPayload, ctx, provider);
  }

  if (isSocialIdentifier(identifierPayload)) {
    return verifySocialIdentifier(identifierPayload, ctx, provider);
  }

  // Sign-In with social verified email or phone
  return verifySocialIdentityInInteractionRecord(identifierPayload, ctx, interactionStorage);
}
