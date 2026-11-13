import {
  type ActionMfaVerification,
  type ActionResultRejection,
  type InteractionIdentifier,
  type MfaVerification,
  MfaFactor,
  type PostFirstFactorVerificationEvent,
  postFirstFactorVerificationResultGuard,
  postSignInResultGuard,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { conditional, isPlainObject } from '@silverhand/essentials';
import { ZodError } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { doesActionPreserveSignInIdentifier } from '#src/libraries/action-identifier-validation.js';
import { toLoggableActionResultIssues } from '#src/libraries/action-sanitization.js';
import { type ActionResultValidation } from '#src/libraries/action.js';
import {
  backupCodeCount,
  isValidBackupCode,
} from '#src/libraries/verification-helpers/backup-code-validation.js';
import { validateTotpSecret } from '#src/libraries/verification-helpers/totp-validation.js';

import { type ActionProvisioningProfile } from '../../types.js';

import { toActionProvisioningProfile } from './action-provisioning-profile.js';

type ActionRejectInvalidCredentialsResult = {
  action: 'rejectInvalidCredentials';
};

export type ValidatedPostFirstFactorVerificationActionResult =
  | ActionRejectInvalidCredentialsResult
  | {
      action: 'createUser';
      user: ActionProvisioningProfile;
      mfaVerifications?: MfaVerification[];
    }
  | {
      action: 'updateUser';
      userId: string;
      user: ActionProvisioningProfile;
      mfaVerifications?: MfaVerification[];
    };

export type ValidatedPostSignInActionResult =
  | {
      action: 'continue';
    }
  | {
      action: 'updateUser';
      userId: string;
      user: ActionProvisioningProfile;
    };

const isActionResultObject = (result: unknown): result is Record<string, unknown> =>
  isPlainObject(result);

/** `null`, `undefined`, and `{}` are how a script returns no decision. */
const isEmptyActionResult = (result: unknown) =>
  result === null ||
  result === undefined ||
  (isActionResultObject(result) && Object.keys(result).length === 0);

type PostFirstFactorVerificationActionResultValidation =
  ActionResultValidation<ValidatedPostFirstFactorVerificationActionResult>;

type PostSignInActionResultValidation = ActionResultValidation<ValidatedPostSignInActionResult>;

type ActionMfaVerificationRejectionReason = NonNullable<
  ActionResultRejection['mfaVerification']
>['reason'];

const rejectInvalidCredentials = (
  rejection: ActionResultRejection
): PostFirstFactorVerificationActionResultValidation => ({
  result: { action: 'rejectInvalidCredentials' },
  rejection,
});

const continueResult = (): ValidatedPostSignInActionResult => ({
  action: 'continue',
});

const identityConflict = (): PostFirstFactorVerificationActionResultValidation => ({
  error: new RequestError({ code: 'session.identity_conflict', status: 409 }),
  rejection: { reason: 'identity_conflict' },
});

const signInIdentifierChanged = (
  identifier: InteractionIdentifier
): PostFirstFactorVerificationActionResultValidation => ({
  error: new RequestError(
    { code: 'action.sign_in_identifier_changed', status: 422 },
    { identifierType: identifier.type }
  ),
  rejection: { reason: 'sign_in_identifier_changed' },
});

const verificationFailed = (
  rejection: ActionResultRejection
): PostSignInActionResultValidation => ({
  error: new RequestError({ code: 'session.verification_failed', status: 400 }),
  rejection,
});

const parseActionProvisioningProfile = (
  user: unknown
): { profile: ActionProvisioningProfile } | { rejection: ActionResultRejection } => {
  try {
    return { profile: toActionProvisioningProfile(user) };
  } catch (error: unknown) {
    return {
      rejection: {
        reason: 'invalid_user_patch',
        ...conditional(
          error instanceof ZodError && {
            issues: toLoggableActionResultIssues(error.issues, ['user']),
          }
        ),
      },
    };
  }
};

/** WebAuthn credential IDs and public keys are unpadded Base64URL strings. */
const isBase64Url = (value: string) => /^[\w-]+$/.test(value) && value.length % 4 !== 1;

const isValidWebAuthnCredential = (credentialId: string, publicKey: string) =>
  isBase64Url(credentialId) && isBase64Url(publicKey);

/**
 * Legacy systems often export TOTP secrets in lowercase, grouped with spaces, or without base32
 * padding. Normalize them to the padded uppercase form Logto validates and stores.
 */
const normalizeTotpSecret = (secret: string) => {
  const compact = secret.replaceAll(/\s/g, '').toUpperCase();
  return compact.padEnd(Math.ceil(compact.length / 8) * 8, '=');
};

/**
 * Migrated users may have used some of their backup codes, so scripts pass only the unused ones:
 * accept up to a full set instead of exactly one.
 */
const getMigratedBackupCodesRejectionReason = (
  codes: string[]
): ActionMfaVerificationRejectionReason | undefined => {
  if (codes.length === 0 || codes.length > backupCodeCount) {
    return 'invalid_backup_code_count';
  }

  if (!codes.every((code) => isValidBackupCode(code))) {
    return 'invalid_backup_code_format';
  }
};

/**
 * Convert one script-supplied MFA factor into a stored verification.
 *
 * Returns the rejection reason when the factor carries invalid credential material. The reason
 * never echoes the credential, so a malformed secret or backup code cannot leak through it.
 */
const toMfaVerification = (
  input: ActionMfaVerification
): { verification: MfaVerification } | { reason: ActionMfaVerificationRejectionReason } => {
  const base = {
    id: generateStandardId(),
    createdAt: new Date().toISOString(),
  };

  switch (input.type) {
    case MfaFactor.TOTP: {
      const secret = normalizeTotpSecret(input.secret);

      return validateTotpSecret(secret)
        ? { verification: { ...base, type: input.type, key: secret } }
        : { reason: 'invalid_totp_secret' };
    }
    case MfaFactor.BackupCode: {
      const reason = getMigratedBackupCodesRejectionReason(input.codes);

      return reason
        ? { reason }
        : {
            verification: {
              ...base,
              type: input.type,
              codes: input.codes.map((code) => ({ code })),
            },
          };
    }
    case MfaFactor.WebAuthn: {
      return isValidWebAuthnCredential(input.credentialId, input.publicKey)
        ? {
            verification: {
              ...base,
              type: input.type,
              credentialId: input.credentialId,
              publicKey: input.publicKey,
              counter: input.counter,
              ...conditional(input.transports !== undefined && { transports: input.transports }),
              agent: input.agent ?? '',
              ...conditional(input.name !== undefined && { name: input.name }),
            },
          }
        : { reason: 'invalid_webauthn_credential' };
    }
  }
};

/** Convert every migrated factor, or reject with the index and type of the first invalid one. */
const toMfaVerifications = (inputs: ActionMfaVerification[] = []) =>
  inputs.reduce<{ mfaVerifications: MfaVerification[] } | { rejection: ActionResultRejection }>(
    (converted, input, index) => {
      if ('rejection' in converted) {
        return converted;
      }

      const verification = toMfaVerification(input);

      return 'reason' in verification
        ? {
            rejection: {
              reason: 'invalid_mfa_verification',
              mfaVerification: { index, type: input.type, reason: verification.reason },
            },
          }
        : { mfaVerifications: [...converted.mfaVerifications, verification.verification] };
    },
    { mfaVerifications: [] }
  );

export const validatePostFirstFactorVerificationActionResult = ({
  event,
  result,
}: {
  event: Pick<PostFirstFactorVerificationEvent, 'user' | 'identifier'>;
  result: unknown;
}): PostFirstFactorVerificationActionResultValidation => {
  // Returning nothing is how a script declines, as the console's default script does when the
  // password does not match. That is a valid result, not a malformed one.
  if (isEmptyActionResult(result)) {
    return { result: { action: 'rejectInvalidCredentials' } };
  }

  const parsed = postFirstFactorVerificationResultGuard.safeParse(result);

  if (!parsed.success) {
    return rejectInvalidCredentials({
      reason: 'invalid_result',
      issues: toLoggableActionResultIssues(parsed.error.issues),
    });
  }

  const parsedProfile = parseActionProvisioningProfile(parsed.data.user);

  if ('rejection' in parsedProfile) {
    return rejectInvalidCredentials(parsedProfile.rejection);
  }

  const convertedMfaVerifications = toMfaVerifications(parsed.data.mfaVerifications);

  if ('rejection' in convertedMfaVerifications) {
    return rejectInvalidCredentials(convertedMfaVerifications.rejection);
  }

  const { profile } = parsedProfile;
  const { mfaVerifications } = convertedMfaVerifications;

  if (!doesActionPreserveSignInIdentifier(event.identifier, profile)) {
    return signInIdentifierChanged(event.identifier);
  }

  const migratedMfaVerifications = conditional(mfaVerifications.length > 0 && { mfaVerifications });

  switch (parsed.data.action) {
    case 'createUser': {
      if (event.user !== null) {
        return identityConflict();
      }

      return {
        result: { action: 'createUser', user: profile, ...migratedMfaVerifications },
      };
    }
    case 'updateUser': {
      if (!event.user) {
        return identityConflict();
      }

      return {
        result: {
          action: 'updateUser',
          userId: event.user.id,
          user: profile,
          ...migratedMfaVerifications,
        },
      };
    }
  }
};

export const validatePostSignInActionResult = ({
  userId,
  result,
}: {
  userId: string;
  result: unknown;
}): PostSignInActionResultValidation => {
  if (isEmptyActionResult(result)) {
    return { result: continueResult() };
  }

  if (!isActionResultObject(result)) {
    return verificationFailed({ reason: 'invalid_result' });
  }

  const parsed = postSignInResultGuard.safeParse(result);

  if (!parsed.success) {
    return verificationFailed({
      reason: 'invalid_result',
      issues: toLoggableActionResultIssues(parsed.error.issues),
    });
  }

  switch (parsed.data.action) {
    case 'updateUser': {
      if (parsed.data.user === undefined) {
        return { result: continueResult() };
      }

      const parsedProfile = parseActionProvisioningProfile(parsed.data.user);

      if ('rejection' in parsedProfile) {
        return verificationFailed(parsedProfile.rejection);
      }

      return { result: { action: 'updateUser', userId, user: parsedProfile.profile } };
    }
  }
};
