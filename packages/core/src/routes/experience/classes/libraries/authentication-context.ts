import {
  AuthenticationFactor,
  AuthenticationFactorClass,
  LogtoAcr,
  SignInIdentifier,
  VerificationType,
  buildAuthenticationMethodReferences,
  getAuthenticationFactor,
  getAuthenticationFactorClass,
  type AuthenticationMethodReference,
  type User,
} from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

import { type VerificationRecord } from '../verifications/index.js';

import { isMfaVerificationRecord } from './mfa-validator.js';

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
  /** The ids of the verification records that identified the user. */
  identifiedVerificationIds: ReadonlySet<string>;
};

/**
 * Whether an MFA record is a proof of the user: verified, not a factor enrolled in this
 * interaction, and bound to the user. TOTP, backup code and WebAuthn records are created for a
 * user and carry that user's id. An MFA email / phone code is sent to the identified user's
 * primary contact, which the MFA verification-code route reads from the user, so the record's
 * identifier must be that contact.
 */
const isMfaProofOfUser = (record: VerificationRecord, user: User): boolean => {
  if (!isMfaVerificationRecord(record) || record.isNewBindMfaVerification) {
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
 * authenticated the identified account: a code sent to an address the user is adding to their
 * profile, or a factor enrolled in this interaction. Only a record bound to the identified user
 * counts:
 *
 * - An MFA record (TOTP, backup code, WebAuthn, MFA email / phone code) counts per
 *   {@link isMfaProofOfUser}.
 * - A sign-in passkey record resolves its `userId` from the asserted credential.
 * - A social or enterprise SSO record contributes only `fed`, never an ACR, so a verified
 *   assertion counts as is. Gating it on the stored identity would drop the very sign-in that
 *   links the identity (the record resolves no account until the submission writes the link).
 * - Any other record (password, verification code, one-time token, new-password identity) counts
 *   when it is one of the records that identified the user, which the interaction recorded at
 *   identification time.
 */
const isProofOfUser = (
  record: VerificationRecord,
  { user, identifiedVerificationIds }: IdentifiedUserContext
): boolean => {
  if (!record.isVerified) {
    return false;
  }

  if (isMfaVerificationRecord(record)) {
    return isMfaProofOfUser(record, user);
  }

  if (record.type === VerificationType.SignInPasskey) {
    return record.userId === user.id;
  }

  if (getAuthenticationFactor(record.type) === AuthenticationFactor.Federated) {
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
      .map(({ type }) => getAuthenticationFactor(type))
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
 *   once, so a one-time token plus an MFA email code stays at `urn:logto:acr:1fa`.
 * - Social / enterprise SSO contribute `fed` to `amr` and nothing to the ACR.
 * - `ts` is the earliest `verifiedAt` among counted records, the most conservative value for a
 *   downstream `max_age` check; it is absent when no counted record carries one.
 */
export const deriveAuthenticationContext = (
  records: VerificationRecord[],
  context: IdentifiedUserContext
): AuthenticationContext => {
  const counted = records.filter((record) => isProofOfUser(record, context));
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
