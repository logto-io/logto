import {
  type ActionMfaVerification,
  type ActionUserPatch,
  type InteractionIdentifier,
  type MfaVerification,
  MfaFactor,
  type PostFirstFactorVerificationEvent,
  postFirstFactorVerificationResultGuard,
  postSignInResultGuard,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { conditional, isPlainObject } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';
import { doesActionPreserveSignInIdentifier } from '#src/libraries/action-identifier-validation.js';
import { validateBackupCodes } from '#src/libraries/verification-helpers/backup-code-validation.js';
import { validateTotpSecret } from '#src/libraries/verification-helpers/totp-validation.js';
import assertThat from '#src/utils/assert-that.js';

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

const invalidCredentialsResult = (): ActionRejectInvalidCredentialsResult => ({
  action: 'rejectInvalidCredentials',
});

const continueResult = (): ValidatedPostSignInActionResult => ({
  action: 'continue',
});

const identityConflictError = () =>
  new RequestError({ code: 'session.identity_conflict', status: 409 });

const verificationFailedError = () =>
  new RequestError({ code: 'session.verification_failed', status: 400 });

const toActionProvisioningProfileSafe = (user: unknown) => {
  try {
    return toActionProvisioningProfile(user);
  } catch {
    // eslint-disable-next-line unicorn/no-useless-undefined -- explicit undefined; bare `return` trips no-useless-return
    return undefined;
  }
};

const assertActionPreservesSignInIdentifier = (
  identifier: InteractionIdentifier,
  userPatch: ActionUserPatch
) => {
  assertThat(
    doesActionPreserveSignInIdentifier(identifier, userPatch),
    new RequestError(
      { code: 'action.sign_in_identifier_changed', status: 422 },
      { identifierType: identifier.type }
    )
  );
};

type MfaVerificationsResult =
  | { success: true; mfaVerifications?: MfaVerification[] }
  | { success: false };

/** WebAuthn credential IDs and public keys are unpadded Base64URL strings. */
const isBase64Url = (value: string) => /^[\w-]+$/.test(value) && value.length % 4 !== 1;

const isValidWebAuthnCredential = (credentialId: string, publicKey: string) =>
  isBase64Url(credentialId) && isBase64Url(publicKey);

/**
 * Convert one script-supplied MFA factor into a stored verification.
 *
 * Returns `undefined` when the factor carries invalid credential material. Format errors never
 * echo the credential, so a malformed secret or backup code cannot leak through an error message.
 */
const toMfaVerification = (input: ActionMfaVerification): MfaVerification | undefined => {
  const base = {
    id: generateStandardId(),
    createdAt: new Date().toISOString(),
  };

  switch (input.type) {
    case MfaFactor.TOTP: {
      return validateTotpSecret(input.secret)
        ? {
            ...base,
            type: input.type,
            key: input.secret,
          }
        : undefined;
    }
    case MfaFactor.BackupCode: {
      return validateBackupCodes(input.codes)
        ? {
            ...base,
            type: input.type,
            codes: input.codes.map((code) => ({ code })),
          }
        : undefined;
    }
    case MfaFactor.WebAuthn: {
      return isValidWebAuthnCredential(input.credentialId, input.publicKey)
        ? {
            ...base,
            type: input.type,
            credentialId: input.credentialId,
            publicKey: input.publicKey,
            counter: input.counter,
            ...conditional(input.rpId !== undefined && { rpId: input.rpId }),
            ...conditional(input.transports !== undefined && { transports: input.transports }),
            agent: input.agent ?? '',
            ...conditional(input.name !== undefined && { name: input.name }),
          }
        : undefined;
    }
  }
};

const toMfaVerifications = (
  inputs: ActionMfaVerification[] | undefined
): MfaVerificationsResult => {
  if (!inputs || inputs.length === 0) {
    return { success: true };
  }

  const mfaVerifications = inputs.reduce<MfaVerification[] | undefined>((verifications, input) => {
    if (!verifications) {
      return;
    }

    const verification = toMfaVerification(input);
    return verification ? [...verifications, verification] : undefined;
  }, []);

  return mfaVerifications ? { success: true, mfaVerifications } : { success: false };
};

export const validatePostFirstFactorVerificationActionResult = ({
  event,
  result,
}: {
  event: Pick<PostFirstFactorVerificationEvent, 'user' | 'identifier'>;
  result: unknown;
}): ValidatedPostFirstFactorVerificationActionResult => {
  const parsed = postFirstFactorVerificationResultGuard.safeParse(result);

  if (!parsed.success) {
    return invalidCredentialsResult();
  }

  const profile = toActionProvisioningProfileSafe(parsed.data.user);

  if (!profile) {
    return invalidCredentialsResult();
  }

  const mfaVerificationsResult = toMfaVerifications(parsed.data.mfaVerifications);

  if (!mfaVerificationsResult.success) {
    return invalidCredentialsResult();
  }

  const { mfaVerifications } = mfaVerificationsResult;

  assertActionPreservesSignInIdentifier(event.identifier, profile);

  switch (parsed.data.action) {
    case 'createUser': {
      assertThat(event.user === null, identityConflictError());

      return {
        action: 'createUser',
        user: profile,
        ...conditional(mfaVerifications && { mfaVerifications }),
      };
    }
    case 'updateUser': {
      assertThat(event.user, identityConflictError());

      return {
        action: 'updateUser',
        userId: event.user.id,
        user: profile,
        ...conditional(mfaVerifications && { mfaVerifications }),
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
}): ValidatedPostSignInActionResult => {
  if (result === null || result === undefined) {
    return continueResult();
  }

  if (!isActionResultObject(result)) {
    throw verificationFailedError();
  }

  if (Object.keys(result).length === 0) {
    return continueResult();
  }

  const parsed = postSignInResultGuard.safeParse(result);

  assertThat(parsed.success, verificationFailedError());

  switch (parsed.data.action) {
    case 'updateUser': {
      if (parsed.data.user === undefined) {
        return continueResult();
      }

      const profile = toActionProvisioningProfileSafe(parsed.data.user);

      assertThat(profile, verificationFailedError());

      return {
        action: 'updateUser',
        userId,
        user: profile,
      };
    }
  }
};
