import {
  AuthenticationFactorClass,
  LogtoAcr,
  MfaFactor,
  SignInIdentifier,
  VerificationType,
  buildAuthenticationMethodReferences,
  getAuthenticationFactorClass,
  type AuthenticationMethodReference,
  type Mfa,
  type User,
} from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

import { getAllUserEnabledMfaVerifications } from '../helpers.js';
import { type VerificationRecord } from '../verifications/index.js';

import { isMfaVerificationRecord, mfaVerificationTypeToMfaFactorMap } from './mfa-validator.js';

/** The authentication context an interaction achieved, in the shape of the provider's `login` result. */
type AuthenticationContext = {
  acr?: LogtoAcr;
  amr?: AuthenticationMethodReference[];
  /** Epoch seconds of the authentication event; becomes `auth_time`. */
  ts?: number;
};

/** What the derivation knows about the identified user; see `ExperienceInteraction`. */
type IdentifiedUserContext = {
  user: User;
  mfaSettings: Mfa;
  /** The ids of the verification records that identified the user. */
  identifiedVerificationIds: ReadonlySet<string>;
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
 * The MFA factors a completed proof in this interaction can be of: enabled in the sign-in
 * experience and enrolled by, or implicit for, the user.
 *
 * {@link getAllUserEnabledMfaVerifications} decides what a new challenge may offer, so it drops a
 * backup code set whose codes are all used. A code consumed in this interaction is still a proof,
 * and the last one is marked used before the submission reloads the user, so the backup code
 * factor stays eligible as long as it is enabled and enrolled.
 */
const getEligibleMfaFactors = (user: User, mfaSettings: Mfa): Set<MfaFactor> =>
  new Set([
    ...getAllUserEnabledMfaVerifications(mfaSettings, user),
    ...(mfaSettings.factors.includes(MfaFactor.BackupCode) &&
    user.mfaVerifications.some(({ type }) => type === MfaFactor.BackupCode)
      ? [MfaFactor.BackupCode]
      : []),
  ]);

/**
 * Whether an MFA record is a proof of the user: verified, not a factor enrolled in this
 * interaction, of an eligible factor (see {@link getEligibleMfaFactors}), and bound to the user.
 * TOTP, backup code and WebAuthn records are created for a user and carry that user's id. An MFA
 * email / phone code is sent to the identified user's primary contact, which the MFA
 * verification-code route reads from the user, so the record's identifier must be that contact.
 */
const isMfaProofOfUser = (
  record: VerificationRecord,
  user: User,
  eligibleMfaFactors: Set<MfaFactor>
): boolean => {
  if (!isMfaVerificationRecord(record)) {
    return false;
  }

  if (
    record.isNewBindMfaVerification ||
    !eligibleMfaFactors.has(mfaVerificationTypeToMfaFactorMap[record.type])
  ) {
    return false;
  }

  if ('userId' in record) {
    return record.userId === user.id;
  }

  const { type, value } = record.identifier;
  return value === (type === SignInIdentifier.Email ? user.primaryEmail : user.primaryPhone);
};

/**
 * Whether a record is a proof that the identified user authenticated in this interaction.
 *
 * A verified record is not a proof by itself. An interaction can hold verified records that never
 * authenticated the identified account: a password proposed for a username nobody owns, a code
 * sent to an address the user is adding to their profile, a factor enrolled in this interaction,
 * or an MFA code requested for a factor the user has not enabled. Only a record bound to the
 * identified user counts:
 *
 * - An MFA record (TOTP, backup code, WebAuthn, MFA email / phone code) counts per
 *   {@link isMfaProofOfUser}.
 * - A sign-in passkey record resolves its `userId` from the asserted credential.
 * - A social or enterprise SSO record contributes only `fed`, never an ACR, so a verified
 *   assertion counts as is. Gating it on the stored identity would drop the very sign-in that
 *   links the identity (the record resolves no account until the submission writes the link).
 * - An identifier record (password, verification code, one-time token) counts when it is one of
 *   the records that identified the user, which the interaction recorded at identification time.
 * - A new-password-identity record only proposes a password for an account that does not exist
 *   yet; it never identifies a user, so it never counts.
 */
const isProofOfUser = (
  record: VerificationRecord,
  { user, identifiedVerificationIds }: IdentifiedUserContext,
  eligibleMfaFactors: Set<MfaFactor>
): boolean => {
  if (!record.isVerified) {
    return false;
  }

  if (isMfaVerificationRecord(record)) {
    return isMfaProofOfUser(record, user, eligibleMfaFactors);
  }

  if (record.type === VerificationType.SignInPasskey) {
    return record.userId === user.id;
  }

  if (authenticationFactors[record.type] === AuthenticationFactor.Federated) {
    return true;
  }

  return identifiedVerificationIds.has(record.id);
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
 * The derivation reads only what the interaction already holds and never queries the database.
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
export const deriveAuthenticationContext = (
  records: VerificationRecord[],
  context: IdentifiedUserContext
): AuthenticationContext => {
  const eligibleMfaFactors = getEligibleMfaFactors(context.user, context.mfaSettings);
  const counted = records.filter((record) => isProofOfUser(record, context, eligibleMfaFactors));
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
