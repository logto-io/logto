import {
  InteractionEvent,
  type IdentifierPayload,
  type SocialConnectorPayload,
  type VerifyVerificationCodePayload,
  SentinelActionResult,
  SentinelActivityTargetType,
  SentinelDecision,
  SentinelActivityAction,
} from '@logto/schemas';
import { type Optional, isKeyInObject } from '@silverhand/essentials';
import { sha256 } from 'hash-wasm';

import RequestError from '#src/errors/RequestError/index.js';
import type { WithLogContext } from '#src/middleware/koa-audit-log.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';
import { i18next } from '#src/utils/i18n.js';

import { type WithInteractionSieContext } from '../middleware/koa-interaction-sie.js';
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
import { verifySsoOnlyEmailIdentifier } from '../utils/single-sign-on-guard.js';
import { verifySocialIdentity } from '../utils/social-verification.js';
import { verifyIdentifierByVerificationCode } from '../utils/verification-code-validation.js';

const verifyPasswordIdentifier = async (
  event: InteractionEvent,
  identifier: PasswordIdentifierPayload,
  ctx: WithLogContext,
  tenant: TenantContext
): Promise<AccountIdIdentifier> => {
  const { password, ...identity } = identifier;

  assertThat(
    event !== InteractionEvent.ForgotPassword,
    'session.not_supported_for_forgot_password'
  );

  const log = ctx.createLog(`Interaction.${event}.Identifier.Password.Submit`);
  log.append({ ...identity });

  const user = await findUserByIdentifier(tenant, identity);
  const verifiedUser = await tenant.libraries.users.verifyUserPassword(user, password);

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
  ctx: WithInteractionSieContext<WithLogContext>,
  tenant: TenantContext
): Promise<SocialIdentifier> => {
  const userInfo = await verifySocialIdentity(identifier, ctx, tenant);

  const {
    libraries: { ssoConnectors },
  } = tenant;

  const { signInExperience } = ctx;

  await verifySsoOnlyEmailIdentifier(ssoConnectors, userInfo, signInExperience);

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

  // Sign-in with social verified email or phone requires a social identifier in the interaction result
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

/**
 * Validate the identifier payload according to the payload type. Type should be one of
 * the following:
 *
 * - Password: If an existing user with the given identifier exists, and the password is
 *   correct, then the payload is valid.
 * - Verification code: If the verification code in the payload matches the one sent to
 *   the given identifier, then the payload is valid.
 * - Social: If the connector can use the session data to retrieve the user info, then
 *   the payload is valid.
 * - Social verified email/phone: If the connector session data contains the verified email
 *   or phone, then the payload is valid.
 */
async function identifierPayloadVerification(
  ctx: WithInteractionSieContext<WithLogContext>,
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

  // Sign-in with social verified email or phone
  return verifySocialVerifiedIdentifier(identifierPayload, ctx, interactionStorage);
}

const getActionByPayload = (payload: IdentifierPayload): Optional<SentinelActivityAction> => {
  if (isPasswordIdentifier(payload)) {
    return SentinelActivityAction.Password;
  }

  if (isVerificationCodeIdentifier(payload)) {
    return SentinelActivityAction.VerificationCode;
  }
};

const getUserIdentifier = (payload: IdentifierPayload): Optional<string> => {
  for (const key of ['username', 'email', 'phone'] as const) {
    if (isKeyInObject(payload, key)) {
      return String(payload[key]);
    }
  }
};

/**
 * Verify the identifier payload, and report the activity to this sentinel. The sentinel
 * will decide whether to block the user or not.
 *
 * If the payload is not recognized, the activity will be ignored. Supported payloads are the
 * cartesian product of (identifier type) x (action type):
 *
 * - Identifier type: Username, email, phone
 * - Action type: Password, verification code
 *
 * @remarks
 * If the user is blocked, the verification will still be performed, but the promise will be
 * rejected with a {@link RequestError} with the code `session.verification_blocked_too_many_attempts`.
 *
 * If the user is not blocked, but the verification throws, the promise will be rejected with
 * the error thrown by the verification.
 *
 * @param verificationPromise The promise that resolves when the verification is complete.
 * @param payload The payload to report.
 * @returns The result of the verification.
 * @throws {RequestError} If the user is blocked.
 * @throws If the user is not blocked but the verification throws.
 * @see {@link identifierPayloadVerification} for the actual verification.
 */
const verifyIdentifierPayload: typeof identifierPayloadVerification = async (
  ctx,
  tenant,
  identifierPayload,
  interactionStorage
) => {
  const action = getActionByPayload(identifierPayload);
  const identifier = getUserIdentifier(identifierPayload);
  const verificationPromise = identifierPayloadVerification(
    ctx,
    tenant,
    identifierPayload,
    interactionStorage
  );

  if (!action || !identifier) {
    return verificationPromise;
  }

  const [result, error] = await (async () => {
    try {
      return [await verificationPromise, undefined];
    } catch (error) {
      return [undefined, error instanceof Error ? error : new Error(String(error))];
    }
  })();

  const actionResult = error ? SentinelActionResult.Failed : SentinelActionResult.Success;

  const [decision, decisionExpiresAt] = await tenant.sentinel.reportActivity({
    targetType: SentinelActivityTargetType.User,
    targetHash: await sha256(identifier),
    action,
    actionResult,
    payload: { event: interactionStorage.event }, // Maybe also include the session data?
  });

  if (decision === SentinelDecision.Blocked) {
    const rtf = new Intl.RelativeTimeFormat([...i18next.languages]);
    throw new RequestError({
      code: 'session.verification_blocked_too_many_attempts',
      relativeTime: rtf.format(Math.round((decisionExpiresAt - Date.now()) / 1000 / 60), 'minute'),
    });
  }

  if (error) {
    throw error;
  }

  return result;
};

export default verifyIdentifierPayload;
