import type {
  InteractionEvent,
  IdentifierPayload,
  SocialConnectorPayload,
  VerifyVerificationCodePayload,
} from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
import { verifyUserPassword } from '#src/libraries/user.js';
import type { WithLogContext } from '#src/middleware/koa-audit-log.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import type {
  PasswordIdentifierPayload,
  SocialIdentifier,
  VerifiedEmailIdentifier,
  VerifiedPhoneIdentifier,
  AnonymousInteractionResult,
  Identifier,
  AccountIdIdentifier,
  SocialVerifiedIdentifierPayload,
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
  ctx: WithLogContext,
  tenant: TenantContext
): Promise<AccountIdIdentifier> => {
  const { password, ...identity } = identifier;

  const log = ctx.createLog(`Interaction.${event}.Identifier.Password.Submit`);
  log.append({ ...identity });

  const user = await findUserByIdentifier(tenant, identity);
  const verifiedUser = await verifyUserPassword(user, password);

  const { isSuspended, id } = verifiedUser;

  assertThat(!isSuspended, new RequestError({ code: 'user.suspended', status: 401 }));

  return { key: 'accountId', value: id };
};

const verifyVerificationCodeIdentifier = async (
  event: InteractionEvent,
  identifier: VerifyVerificationCodePayload,
  ctx: WithLogContext,
  { provider, libraries }: TenantContext
): Promise<VerifiedEmailIdentifier | VerifiedPhoneIdentifier> => {
  const { jti } = await provider.interactionDetails(ctx.req, ctx.res);

  await verifyIdentifierByVerificationCode(
    { ...identifier, event },
    jti,
    ctx.createLog,
    libraries.passcodes
  );

  return 'email' in identifier
    ? { key: 'emailVerified', value: identifier.email }
    : { key: 'phoneVerified', value: identifier.phone };
};

const verifySocialIdentifier = async (
  identifier: SocialConnectorPayload,
  ctx: WithLogContext,
  tenant: TenantContext
): Promise<SocialIdentifier> => {
  const userInfo = await verifySocialIdentity(identifier, ctx, tenant);

  return { key: 'social', connectorId: identifier.connectorId, userInfo };
};

const verifySocialVerifiedIdentifier = async (
  payload: SocialVerifiedIdentifierPayload,
  ctx: WithLogContext,
  interactionRecord?: AnonymousInteractionResult
): Promise<VerifiedEmailIdentifier | VerifiedPhoneIdentifier> => {
  const log = ctx.createLog(`Interaction.SignIn.Identifier.Social.Submit`);
  log.append(payload);

  const { connectorId } = payload;

  // Sign-In with social verified email or phone requires a social identifier in the interaction result
  const socialIdentifierRecord = interactionRecord?.identifiers?.find(
    (entity): entity is SocialIdentifier =>
      entity.key === 'social' && entity.connectorId === connectorId
  );

  assertThat(socialIdentifierRecord, new RequestError('session.connector_session_not_found'));

  // Verified Email Payload
  if ('email' in payload) {
    const { email } = payload;
    assertThat(
      socialIdentifierRecord.userInfo.email === email,
      new RequestError('session.connector_session_not_found')
    );

    return {
      key: 'emailVerified',
      value: email,
    };
  }

  // Verified Phone Payload
  const { phone } = payload;
  assertThat(
    socialIdentifierRecord.userInfo.phone === phone,
    new RequestError('session.connector_session_not_found')
  );

  return {
    key: 'phoneVerified',
    value: phone,
  };
};

export default async function identifierPayloadVerification(
  ctx: WithLogContext,
  tenant: TenantContext,
  identifierPayload: IdentifierPayload,
  interactionStorage: AnonymousInteractionResult
): Promise<Identifier> {
  const { event } = interactionStorage;

  if (isPasswordIdentifier(identifierPayload)) {
    return verifyPasswordIdentifier(event, identifierPayload, ctx, tenant);
  }

  if (isVerificationCodeIdentifier(identifierPayload)) {
    return verifyVerificationCodeIdentifier(event, identifierPayload, ctx, tenant);
  }

  if (isSocialIdentifier(identifierPayload)) {
    return verifySocialIdentifier(identifierPayload, ctx, tenant);
  }

  // Sign-In with social verified email or phone
  return verifySocialVerifiedIdentifier(identifierPayload, ctx, interactionStorage);
}
