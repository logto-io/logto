import {
  InteractionEvent,
  SentinelActivityAction,
  SignInIdentifier,
  type VerificationCodeIdentifier,
  VerificationType,
  type Sentinel,
} from '@logto/schemas';
import { Action } from '@logto/schemas/lib/types/log/interaction.js';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { type PasscodeLibrary } from '#src/libraries/passcode.js';
import { type LogContext } from '#src/middleware/koa-audit-log.js';
import { buildMessageRateGuard, withMessageRateGuard } from '#src/sentinel/message-rate-guard.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import { getLogtoCookie } from '#src/utils/cookie.js';

import type ExperienceInteraction from '../classes/experience-interaction.js';
import { withSentinel } from '../classes/libraries/sentinel-guard.js';
import { codeVerificationIdentifierRecordTypeMap } from '../classes/utils.js';
import type {
  EmailCodeVerification,
  PhoneCodeVerification,
  MfaEmailCodeVerification,
  MfaPhoneCodeVerification,
} from '../classes/verifications/code-verification.js';
import { type ExperienceInteractionRouterContext } from '../types.js';

type CodeVerificationRecord =
  | EmailCodeVerification
  | PhoneCodeVerification
  | MfaEmailCodeVerification
  | MfaPhoneCodeVerification;

const createVerificationCodeAuditLog = (
  { createLog }: LogContext,
  { interactionEvent }: ExperienceInteraction,
  identifier: VerificationCodeIdentifier,
  action: Action
) => {
  const verificationType = codeVerificationIdentifierRecordTypeMap[identifier.type];

  return createLog(`Interaction.${interactionEvent}.Verification.${verificationType}.${action}`);
};

const buildVerificationCodeTemplateContext = async (
  passcodeLibrary: PasscodeLibrary,
  ctx: ExperienceInteractionRouterContext,
  { type }: VerificationCodeIdentifier
) => {
  // Build extra context for email verification only
  if (type !== SignInIdentifier.Email) {
    return {};
  }

  const { appId: applicationId, organizationId } = getLogtoCookie(ctx);

  return passcodeLibrary.buildVerificationCodeContext(
    {
      applicationId,
      organizationId,
    },
    ctx
  );
};

type SendCodeParams = {
  identifier: VerificationCodeIdentifier;
  interactionEvent?: InteractionEvent;
  createVerificationRecord: () => CodeVerificationRecord;
  libraries: Libraries;
  queries: Queries;
  ctx: ExperienceInteractionRouterContext;
};

/** Whether a user exists with the given identifier (email or phone). */
const hasUserWithIdentifier = async (
  queries: Queries,
  identifier: VerificationCodeIdentifier
): Promise<boolean> => {
  const { type, value } = identifier;

  if (type === SignInIdentifier.Email) {
    return queries.users.hasUserWithEmail(value);
  }

  return queries.users.hasUserWithNormalizedPhone(value);
};

/**
 * Whether to create the passcode record but suppress delivery, for a recipient with no legitimate
 * reason to receive a code (anti-enumeration / anti-spam). The record is still created, so a later
 * verify returns `code_mismatch`, not `not_found`. Two cases:
 *
 * - Forgot-password to an identifier no user owns (always on).
 * - Sign-in from an unidentified session to an identifier no user owns when registration is
 *   disabled (behind `isDevFeaturesEnabled`); identified sessions always deliver.
 */
const shouldSkipDelivery = async (
  experienceInteraction: ExperienceInteraction,
  queries: Queries,
  identifier: VerificationCodeIdentifier,
  interactionEvent?: InteractionEvent
): Promise<boolean> => {
  if (interactionEvent === InteractionEvent.ForgotPassword) {
    return !(await hasUserWithIdentifier(queries, identifier));
  }

  if (
    EnvSet.values.isDevFeaturesEnabled &&
    interactionEvent === InteractionEvent.SignIn &&
    !experienceInteraction.identifiedUserId
  ) {
    const registrationDisabled =
      await experienceInteraction.signInExperienceValidator.isRegistrationDisabled();

    return registrationDisabled && !(await hasUserWithIdentifier(queries, identifier));
  }

  return false;
};

/**
 * Shared logic for sending verification codes (both regular and MFA flows)
 * @internal
 */
export const sendCode = async ({
  identifier,
  interactionEvent,
  createVerificationRecord,
  libraries,
  queries,
  ctx,
}: SendCodeParams): Promise<{ verificationId: string }> => {
  const { experienceInteraction } = ctx;

  const log = createVerificationCodeAuditLog(ctx, experienceInteraction, identifier, Action.Create);

  log.append({
    payload: {
      identifier,
      ...(interactionEvent && { interactionEvent }),
    },
  });

  const codeVerification = createVerificationRecord();

  // Pre-validate email against blocklist for registration
  if (
    interactionEvent === InteractionEvent.Register &&
    identifier.type === SignInIdentifier.Email
  ) {
    await experienceInteraction.signInExperienceValidator.guardEmailBlocklist(codeVerification);
  }

  const skipDelivery = await shouldSkipDelivery(
    experienceInteraction,
    queries,
    identifier,
    interactionEvent
  );

  const payload = skipDelivery
    ? undefined
    : {
        ...ctx.emailI18n,
        ...(await buildVerificationCodeTemplateContext(libraries.passcodes, ctx, identifier)),
        /** The client IP address for rate limiting and fraud detection. */
        ...(ctx.request.ip && { ip: ctx.request.ip }),
      };

  // Send verification code. When delivery is skipped (see `shouldSkipDelivery`) nothing is sent, so
  // the rate guard is bypassed.
  const send = async () => codeVerification.sendVerificationCode(payload, { skipDelivery });

  const messageRateLimit = {
    action: SentinelActivityAction.VerificationCodeSend,
    recipient: identifier.value,
  };

  await (skipDelivery || !EnvSet.values.isDevFeaturesEnabled
    ? send()
    : withMessageRateGuard(
        await buildMessageRateGuard(queries),
        {
          ...messageRateLimit,
          onRateLimited: () => {
            ctx.appendExceptionHookContext('Message.RateLimited', messageRateLimit);
          },
        },
        send
      ));

  // Save state
  experienceInteraction.setVerificationRecord(codeVerification);
  await experienceInteraction.save();

  return {
    verificationId: codeVerification.id,
  };
};

type VerifyCodeParams = {
  verificationId: string;
  code: string;
  identifier: VerificationCodeIdentifier;
  verificationType:
    | VerificationType.EmailVerificationCode
    | VerificationType.PhoneVerificationCode
    | VerificationType.MfaEmailVerificationCode
    | VerificationType.MfaPhoneVerificationCode;
  sentinel: Sentinel;
  ctx: ExperienceInteractionRouterContext;
};

/**
 * Shared logic for verifying codes (both regular and MFA flows)
 * @internal
 */
export const verifyCode = async ({
  verificationId,
  code,
  identifier,
  verificationType,
  sentinel,
  ctx,
}: VerifyCodeParams): Promise<{ verificationId: string }> => {
  const { experienceInteraction } = ctx;

  // Create audit log
  const log = createVerificationCodeAuditLog(ctx, experienceInteraction, identifier, Action.Submit);

  log.append({
    payload: {
      identifier,
      verificationId,
      code,
    },
  });

  // Get verification record - the type system ensures this is a code verification record
  // because verificationType is constrained to code verification types
  const codeVerificationRecord = experienceInteraction.getVerificationRecordByTypeAndId(
    verificationType,
    verificationId
  );

  // Verify with sentinel protection
  // The verify method is guaranteed to exist because verificationType is constrained
  // to code verification types (Email, Phone, MfaEmail, MfaPhone)
  await withSentinel(
    {
      ctx,
      sentinel,
      action: SentinelActivityAction.VerificationCode,
      identifier,
      payload: {
        event: experienceInteraction.interactionEvent,
        verificationId: codeVerificationRecord.id,
      },
    },
    codeVerificationRecord.verify(identifier, code)
  );

  // Save state
  await experienceInteraction.save();

  return {
    verificationId: codeVerificationRecord.id,
  };
};

type GetMfaIdentifierParams = {
  identifierType: SignInIdentifier.Email | SignInIdentifier.Phone;
  experienceInteraction: ExperienceInteraction;
  queries: Queries;
};

/**
 * Helper to get MFA identifier from user profile
 * @internal
 */
export const getMfaIdentifier = async ({
  identifierType,
  experienceInteraction,
  queries,
}: GetMfaIdentifierParams): Promise<VerificationCodeIdentifier> => {
  if (!experienceInteraction.identifiedUserId) {
    throw new RequestError({
      code: 'session.identifier_not_found',
      status: 400,
    });
  }

  const user = await queries.users.findUserById(experienceInteraction.identifiedUserId);
  const identifierValue =
    identifierType === SignInIdentifier.Email ? user.primaryEmail : user.primaryPhone;

  if (!identifierValue) {
    throw new RequestError({
      code: 'session.mfa.mfa_factor_not_enabled',
      status: 400,
    });
  }

  return {
    type: identifierType,
    value: identifierValue,
  };
};

/**
 * Helper to determine MFA verification type based on identifier type
 * @internal
 */
export const getMfaVerificationType = (
  identifierType: SignInIdentifier.Email | SignInIdentifier.Phone
): VerificationType.MfaEmailVerificationCode | VerificationType.MfaPhoneVerificationCode => {
  return identifierType === SignInIdentifier.Email
    ? VerificationType.MfaEmailVerificationCode
    : VerificationType.MfaPhoneVerificationCode;
};
