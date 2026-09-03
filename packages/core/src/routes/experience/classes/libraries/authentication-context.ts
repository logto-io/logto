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

import { isMfaVerificationRecord, type MfaValidator } from './mfa-validator.js';

/** The authentication context an interaction achieved, in the shape of the provider's `login` result. */
type AuthenticationContext = {
  acr?: LogtoAcr;
  amr?: AuthenticationMethodReference[];
  /** Epoch seconds of the authentication event; becomes `auth_time`. */
  ts?: number;
};

/**
 * The factor a verification record is a proof of. Repeated proofs of one factor count once, and
 * `urn:logto:acr:mfa` needs a `1fa`-class and an `mfa`-class proof of two different factors: a
 * primary email code and an MFA email code are two proofs of the same contact, not two factors.
 */
enum AuthenticationFactor {
  Password = 'password',
  Email = 'email',
  Phone = 'phone',
  Totp = 'totp',
  BackupCode = 'backupCode',
  WebAuthn = 'webAuthn',
  Federated = 'federated',
}

/** Keyed by every {@link VerificationType}, so a new type fails at compile time until mapped. */
const authenticationFactors: Readonly<Record<VerificationType, AuthenticationFactor>> =
  Object.freeze({
    [VerificationType.Password]: AuthenticationFactor.Password,
    [VerificationType.NewPasswordIdentity]: AuthenticationFactor.Password,
    [VerificationType.EmailVerificationCode]: AuthenticationFactor.Email,
    [VerificationType.MfaEmailVerificationCode]: AuthenticationFactor.Email,
    [VerificationType.OneTimeToken]: AuthenticationFactor.Email,
    [VerificationType.PhoneVerificationCode]: AuthenticationFactor.Phone,
    [VerificationType.MfaPhoneVerificationCode]: AuthenticationFactor.Phone,
    [VerificationType.TOTP]: AuthenticationFactor.Totp,
    [VerificationType.BackupCode]: AuthenticationFactor.BackupCode,
    [VerificationType.WebAuthn]: AuthenticationFactor.WebAuthn,
    [VerificationType.SignInPasskey]: AuthenticationFactor.WebAuthn,
    [VerificationType.Social]: AuthenticationFactor.Federated,
    [VerificationType.EnterpriseSso]: AuthenticationFactor.Federated,
  });

/**
 * Whether a record is a proof that the identified user authenticated in this interaction.
 *
 * A verified record is not a proof by itself. An interaction can hold verified records that never
 * authenticated the identified account: a password proposed for a username nobody owns, a code
 * sent to an address the user is adding to their profile, a factor enrolled in this interaction,
 * or an MFA code requested for a factor the user has not enabled. Only a record bound to the
 * identified user counts:
 *
 * - An MFA record (TOTP, backup code, WebAuthn, MFA email / phone code) counts only when the
 *   {@link MfaValidator} accepts it: verified, not a new enrollment, and of a factor enabled for
 *   the user. TOTP, backup code and WebAuthn records are created for a user and must carry that
 *   user's id; MFA email / phone codes are identifier records checked like the ones below.
 * - A sign-in passkey record resolves its `userId` from the asserted credential.
 * - A social or enterprise SSO record contributes only `fed`, never an ACR, so a verified
 *   assertion counts as is. Gating it on the stored identity would drop the very sign-in that
 *   links the identity (the record resolves no account until the submission writes the link).
 * - An identifier record (password, verification code, one-time token) counts when the account
 *   it identifies is the identified user.
 * - A new-password-identity record only proposes a password for an account that does not exist
 *   yet, so it never counts.
 */
const isProofOfUser = async (
  record: VerificationRecord,
  userId: string,
  eligibleMfaRecords: Set<VerificationRecord>
): Promise<boolean> => {
  if (!record.isVerified) {
    return false;
  }

  if (isMfaVerificationRecord(record) && !eligibleMfaRecords.has(record)) {
    return false;
  }

  // TOTP, backup code and WebAuthn records are created for a user; a sign-in passkey record
  // resolves its user from the asserted credential.
  if ('userId' in record) {
    return record.userId === userId;
  }

  if (authenticationFactors[record.type] === AuthenticationFactor.Federated) {
    return true;
  }

  if (!('identifyUser' in record)) {
    return false;
  }

  try {
    const { id } = await record.identifyUser();
    return id === userId;
  } catch (error: unknown) {
    // The record identifies no account (a code for an unregistered address): it is not a proof
    // for this user.
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

/** The factors with a counted record of the given class. */
const factorsOfClass = (records: VerificationRecord[], factorClass: AuthenticationFactorClass) =>
  new Set(
    records
      .filter(({ type }) => getAuthenticationFactorClass(type) === factorClass)
      .map(({ type }) => authenticationFactors[type])
  );

/**
 * Derive the authentication context the identified user achieved through the verification records
 * of one interaction. Only records that are proofs of that user count; see {@link isProofOfUser}.
 *
 * Call it before the submission writes anything to the account: a record whose identifier or
 * identity is only being added by this submission must not become a proof once written.
 *
 * - A `1fa`-class proof (password, primary email / phone code, one-time token) reaches
 *   `urn:logto:acr:1fa`; an `mfa`-class proof alone also reaches only `urn:logto:acr:1fa`.
 * - A `1fa`-class proof plus an `mfa`-class proof of a different factor, or a user-verified
 *   WebAuthn assertion alone, reaches `urn:logto:acr:mfa`. Repeated proofs of one factor count
 *   once, so a primary email code plus an MFA email code stays at `urn:logto:acr:1fa`.
 * - Social / enterprise SSO contribute `fed` to `amr` and nothing to the ACR.
 * - `ts` is the earliest `verifiedAt` among counted records, the most conservative value for a
 *   downstream `max_age` check; it is absent when no counted record carries one.
 */
export const deriveAuthenticationContext = async (
  records: VerificationRecord[],
  userId: string,
  mfaValidator: MfaValidator
): Promise<AuthenticationContext> => {
  const eligibleMfaRecords = new Set<VerificationRecord>(
    mfaValidator.getVerifiedMfaVerificationRecords(records)
  );
  const proofs = await Promise.all(
    records.map(async (record) => isProofOfUser(record, userId, eligibleMfaRecords))
  );
  const counted = records.filter((_, index) => proofs[index]);
  const firstFactors = factorsOfClass(counted, AuthenticationFactorClass.FirstFactor);
  const mfaFactors = factorsOfClass(counted, AuthenticationFactorClass.Mfa);
  const hasDistinctMfaFactor = [...mfaFactors].some(
    (factor) => firstFactors.size > (firstFactors.has(factor) ? 1 : 0)
  );

  const acr =
    hasDistinctMfaFactor || counted.some((record) => isUserVerifiedWebAuthn(record))
      ? LogtoAcr.Mfa
      : conditional((firstFactors.size > 0 || mfaFactors.size > 0) && LogtoAcr.FirstFactor);
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
