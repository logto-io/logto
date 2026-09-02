import {
  AuthenticationFactorClass,
  LogtoAcr,
  VerificationType,
  buildAuthenticationMethodReferences,
  getAuthenticationFactorClass,
  type AuthenticationMethodReference,
} from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

import { type VerificationRecord } from '../verifications/index.js';

/** The authentication context an interaction achieved, in the shape of the provider's `login` result. */
type AuthenticationContext = {
  acr?: LogtoAcr;
  amr?: AuthenticationMethodReference[];
  /** Epoch seconds of the authentication event; becomes `auth_time`. */
  ts?: number;
};

/**
 * Whether a record counts toward the achieved context: it must be verified, and a factor enrolled
 * in this interaction never counts (that extension is owned by the step-up establishment work).
 */
const isCountedRecord = (record: VerificationRecord) =>
  record.isVerified && !('isNewBindMfaVerification' in record && record.isNewBindMfaVerification);

/**
 * Whether the record is a WebAuthn assertion. Logto always requires user verification for WebAuthn
 * (`requireUserVerification: true` in the verification helpers), so a verified record is a
 * user-verified passkey and reaches `urn:logto:acr:mfa` on its own.
 */
const isUserVerifiedWebAuthn = ({ type }: VerificationRecord) =>
  type === VerificationType.WebAuthn || type === VerificationType.SignInPasskey;

/**
 * Derive the authentication context achieved by the verification records of one interaction.
 *
 * - A `1fa`-class record (password, primary email / phone code, one-time token) reaches
 *   `urn:logto:acr:1fa`; an `mfa`-class record alone also reaches only `urn:logto:acr:1fa`.
 * - A `1fa`-class record plus an `mfa`-class record, or a user-verified WebAuthn assertion alone,
 *   reaches `urn:logto:acr:mfa`.
 * - Social / enterprise SSO contribute `fed` to `amr` and nothing to the ACR.
 * - `ts` is the earliest `verifiedAt` among counted records, the most conservative value for a
 *   downstream `max_age` check; it is absent when no counted record carries one.
 */
export const deriveAuthenticationContext = (
  records: VerificationRecord[]
): AuthenticationContext => {
  const counted = records.filter((record) => isCountedRecord(record));
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
