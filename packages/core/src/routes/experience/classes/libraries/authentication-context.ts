import {
  AuthenticationFactorClass,
  LogtoAcr,
  VerificationType,
  buildAuthenticationMethodReferences,
  getAuthenticationFactorClass,
  type AuthenticationMethodReference,
} from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';

import { type VerificationRecord } from '../verifications/index.js';

/** The authentication context an interaction achieved, in the shape of the provider's `login` result. */
type AuthenticationContext = {
  acr?: LogtoAcr;
  amr?: AuthenticationMethodReference[];
  /** Epoch seconds of the authentication event; becomes `auth_time`. */
  ts?: number;
};

/**
 * Whether a record is a proof that the identified user authenticated in this interaction.
 *
 * A verified record is not a proof by itself. An interaction can hold verified records that never
 * authenticated the identified account: a password proposed for a username nobody owns, a code
 * sent to an address the user is adding to their profile, a social identity being linked, or a
 * factor enrolled in this interaction. Only a record bound to the identified user counts:
 *
 * - An MFA record (TOTP, backup code, WebAuthn) is created for a user and verified against that
 *   user's enrolled factors; it counts when it is not a new enrollment and its `userId` matches.
 * - A sign-in passkey record resolves its `userId` from the asserted credential.
 * - An identifier record (password, verification code, one-time token, social, enterprise SSO)
 *   counts when the account it identifies is the identified user.
 * - A new-password-identity record only proposes a password for an account that does not exist
 *   yet, so it never counts.
 */
const isProofOfUser = async (record: VerificationRecord, userId: string): Promise<boolean> => {
  if (!record.isVerified) {
    return false;
  }

  if (
    record.type === VerificationType.TOTP ||
    record.type === VerificationType.BackupCode ||
    record.type === VerificationType.WebAuthn
  ) {
    return !record.isNewBindMfaVerification && record.userId === userId;
  }

  if (record.type === VerificationType.SignInPasskey) {
    return record.userId === userId;
  }

  if (!('identifyUser' in record)) {
    return false;
  }

  try {
    const { id } = await record.identifyUser();
    return id === userId;
  } catch (error: unknown) {
    // The record identifies no account (a code for an unregistered address, an identity that is
    // not linked yet): it is not a proof for this user.
    if (error instanceof RequestError) {
      return false;
    }

    throw error;
  }
};

/**
 * Whether the record is a WebAuthn assertion. Logto always requires user verification for WebAuthn
 * (`requireUserVerification: true` in the verification helpers), so a verified record is a
 * user-verified passkey and reaches `urn:logto:acr:mfa` on its own.
 */
const isUserVerifiedWebAuthn = ({ type }: VerificationRecord) =>
  type === VerificationType.WebAuthn || type === VerificationType.SignInPasskey;

/**
 * Derive the authentication context the identified user achieved through the verification records
 * of one interaction. Only records that are proofs of that user count; see {@link isProofOfUser}.
 *
 * Call it before the submission writes anything to the account: a record whose identifier or
 * identity is only being added by this submission must not become a proof once written.
 *
 * - A `1fa`-class record (password, primary email / phone code, one-time token) reaches
 *   `urn:logto:acr:1fa`; an `mfa`-class record alone also reaches only `urn:logto:acr:1fa`.
 * - A `1fa`-class record plus an `mfa`-class record, or a user-verified WebAuthn assertion alone,
 *   reaches `urn:logto:acr:mfa`.
 * - Social / enterprise SSO contribute `fed` to `amr` and nothing to the ACR.
 * - `ts` is the earliest `verifiedAt` among counted records, the most conservative value for a
 *   downstream `max_age` check; it is absent when no counted record carries one.
 */
export const deriveAuthenticationContext = async (
  records: VerificationRecord[],
  userId: string
): Promise<AuthenticationContext> => {
  const proofs = await Promise.all(records.map(async (record) => isProofOfUser(record, userId)));
  const counted = records.filter((_, index) => proofs[index]);
  const classes = new Set(counted.map(({ type }) => getAuthenticationFactorClass(type)));
  const hasFirstFactor = classes.has(AuthenticationFactorClass.FirstFactor);
  const hasMfaRecord = classes.has(AuthenticationFactorClass.Mfa);

  const acr =
    (hasFirstFactor && hasMfaRecord) || counted.some((record) => isUserVerifiedWebAuthn(record))
      ? LogtoAcr.Mfa
      : conditional((hasFirstFactor || hasMfaRecord) && LogtoAcr.FirstFactor);
  const amr = buildAuthenticationMethodReferences(
    counted.map(({ type }) => type),
    acr
  );
  const timestamps = counted
    .map(({ verifiedAt }) => verifiedAt)
    .filter((verifiedAt): verifiedAt is number => typeof verifiedAt === 'number');

  return {
    ...conditional(acr && { acr }),
    ...conditional(amr.length > 0 && { amr }),
    ...conditional(timestamps.length > 0 && { ts: Math.min(...timestamps) }),
  };
};
