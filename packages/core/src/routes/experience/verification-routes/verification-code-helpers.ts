import {
  InteractionEvent,
  logtoCookieKey,
  logtoUiCookieGuard,
  SentinelActivityAction,
  SignInIdentifier,
  type VerificationCodeIdentifier,
  VerificationType,
  type Sentinel,
} from '@logto/schemas';
import { Action } from '@logto/schemas/lib/types/log/interaction.js';
import { trySafe } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';
import { type PasscodeLibrary } from '#src/libraries/passcode.js';
import { type LogContext } from '#src/middleware/koa-audit-log.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';

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

  // Safely get the orgId and appId context from cookie
  const { appId: applicationId, organizationId } =
    trySafe(() => logtoUiCookieGuard.parse(JSON.parse(ctx.cookies.get(logtoCookieKey) ?? '{}'))) ??
    {};

  return passcodeLibrary.buildVerificationCodeContext({
    applicationId,
    organizationId,
  });
};

type SendCodeParams = {
  identifier: VerificationCodeIdentifier;
  interactionEvent?: InteractionEvent;
  createVerificationRecord: () => CodeVerificationRecord;
  libraries: Libraries;
  ctx: ExperienceInteractionRouterContext;
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

  // Build template context
  const templateContext = await buildVerificationCodeTemplateContext(
    libraries.passcodes,
    ctx,
    identifier
  );

  // Send verification code
  await codeVerification.sendVerificationCode({
    locale: ctx.locale,
    ...templateContext,
  });

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
