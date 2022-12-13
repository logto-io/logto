import type { GetSession } from '@logto/connector-kit';
import type { Event, SocialConnectorPayload, SocialIdentityPayload } from '@logto/schemas';
import type { Provider } from 'oidc-provider';

import RequestError from '#src/errors/RequestError/index.js';
import { verifyUserPassword } from '#src/libraries/user.js';
import { getConnectorSessionResult } from '#src/routes/session/utils.js';
import assertThat from '#src/utils/assert-that.js';

import type {
  PasswordIdentifierPayload,
  PasscodeIdentifierPayload,
  InteractionContext,
  SocialIdentifier,
  VerifiedEmailIdentifier,
  VerifiedPhoneIdentifier,
  AnonymousInteractionResult,
  PayloadVerifiedInteractionResult,
  Identifier,
  AccountIdIdentifier,
} from '../types/index.js';
import findUserByIdentifier from '../utils/find-user-by-identifier.js';
import { isPasscodeIdentifier, isPasswordIdentifier, isSocialIdentifier } from '../utils/index.js';
import { mergeIdentifiers, storeInteractionResult } from '../utils/interaction.js';
import { verifyIdentifierByPasscode } from '../utils/passcode-validation.js';
import { verifySocialIdentity } from '../utils/social-verification.js';

const verifyPasswordIdentifier = async (
  identifier: PasswordIdentifierPayload
): Promise<AccountIdIdentifier> => {
  // TODO: Log
  const { password, ...identity } = identifier;
  const user = await findUserByIdentifier(identity);
  const verifiedUser = await verifyUserPassword(user, password);

  const { isSuspended, id } = verifiedUser;

  assertThat(!isSuspended, new RequestError({ code: 'user.suspended', status: 401 }));

  return { key: 'accountId', value: id };
};

const verifyPasscodeIdentifier = async (
  event: Event,
  identifier: PasscodeIdentifierPayload,
  ctx: InteractionContext,
  provider: Provider
): Promise<VerifiedEmailIdentifier | VerifiedPhoneIdentifier> => {
  const { jti } = await provider.interactionDetails(ctx.req, ctx.res);

  await verifyIdentifierByPasscode({ ...identifier, event }, jti, ctx.createLog);

  return 'email' in identifier
    ? { key: 'emailVerified', value: identifier.email }
    : { key: 'phoneVerified', value: identifier.phone };
};

const verifySocialIdentifier = async (
  identifier: SocialConnectorPayload,
  ctx: InteractionContext,
  getSession?: GetSession
): Promise<SocialIdentifier> => {
  const userInfo = await verifySocialIdentity(identifier, ctx.createLog, getSession);

  return { key: 'social', connectorId: identifier.connectorId, userInfo };
};

const verifySocialIdentityInInteractionRecord = async (
  { connectorId, identityType }: SocialIdentityPayload,
  interactionRecord?: AnonymousInteractionResult
): Promise<VerifiedEmailIdentifier | VerifiedPhoneIdentifier> => {
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

const verifyIdentifierPayload = async (
  ctx: InteractionContext,
  provider: Provider,
  interactionRecord?: AnonymousInteractionResult
): Promise<Identifier | undefined> => {
  const { identifier, event } = ctx.interactionPayload;

  // No Identifier in payload
  if (!identifier) {
    return;
  }

  if (isPasswordIdentifier(identifier)) {
    return verifyPasswordIdentifier(identifier);
  }

  if (isPasscodeIdentifier(identifier)) {
    return verifyPasscodeIdentifier(event, identifier, ctx, provider);
  }

  if (isSocialIdentifier(identifier)) {
    return verifySocialIdentifier(identifier, ctx, async () =>
      getConnectorSessionResult(ctx, provider)
    );
  }

  // Sign-In with social verified email or phone
  return verifySocialIdentityInInteractionRecord(identifier, interactionRecord);
};

export default async function identifierPayloadVerification(
  ctx: InteractionContext,
  provider: Provider,
  interactionRecord?: AnonymousInteractionResult
): Promise<PayloadVerifiedInteractionResult> {
  const { event } = ctx.interactionPayload;

  const identifier = await verifyIdentifierPayload(ctx, provider, interactionRecord);

  const interaction: PayloadVerifiedInteractionResult = {
    ...interactionRecord,
    event,
    identifiers: identifier
      ? mergeIdentifiers([identifier], interactionRecord?.identifiers)
      : interactionRecord?.identifiers,
  };

  await storeInteractionResult(interaction, ctx, provider);

  return interaction;
}
