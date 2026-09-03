/**
 * @file The vocabulary for the authentication context Logto records on a sign-in: the supported
 * Authentication Context Class Reference (ACR) values and the Authentication Methods References
 * (AMR) each verification type contributes.
 *
 * @see {@link https://openid.net/specs/openid-connect-core-1_0.html#IDToken | OpenID Connect Core `acr` / `amr`}
 * @see {@link https://www.rfc-editor.org/rfc/rfc8176.html | RFC 8176 Authentication Method Reference Values}
 */
import { VerificationType } from './verification-records/verification-type.js';

/** The Logto-defined ACR values. Only these can be requested through `acr_values`. */
export enum LogtoAcr {
  /**
   * At least one active factor that Logto can directly verify: password, the user's primary
   * email / phone verification code, or a one-time token. Social and enterprise SSO never satisfy
   * this class.
   */
  FirstFactor = 'urn:logto:acr:1fa',
  /**
   * A {@link LogtoAcr.FirstFactor} context plus a second factor, or a user-verified WebAuthn
   * assertion alone.
   */
  Mfa = 'urn:logto:acr:mfa',
}

/** The ACR values advertised in Discovery as `acr_values_supported`, in the provider order. */
export const logtoAcrValues = Object.freeze([LogtoAcr.FirstFactor, LogtoAcr.Mfa] as const);

/**
 * The AMR values Logto emits. All except {@link AuthenticationMethodReference.Federated} are
 * registered in RFC 8176; `fed` is the de facto industry value for authentication delegated to an
 * upstream identity provider and is the only unregistered value Logto emits.
 */
export enum AuthenticationMethodReference {
  /** Password-based authentication. */
  Password = 'pwd',
  /** One-time password: email verification code, TOTP, backup code, or one-time token. */
  Otp = 'otp',
  /** Verification code delivered by SMS. */
  Sms = 'sms',
  /** Proof-of-possession of a key, e.g. WebAuthn. */
  ProofOfPossession = 'pop',
  /** User presence / verification by the authenticator, e.g. WebAuthn user verification. */
  UserPresence = 'user',
  /** Multiple-factor authentication; present whenever the achieved ACR is {@link LogtoAcr.Mfa}. */
  Mfa = 'mfa',
  /** Federated authentication assertion from a social or enterprise SSO provider. */
  Federated = 'fed',
}

/**
 * The AMR values a single verification type contributes, per the step-up tech design. The record
 * is keyed by every {@link VerificationType}, so a new type fails at compile time until it is
 * mapped here.
 *
 * WebAuthn carries `mfa` inherently: Logto always requires user verification, so a verified
 * passkey assertion is a multi-factor authenticator on its own.
 */
const authenticationMethodReferences: Readonly<
  Record<VerificationType, readonly AuthenticationMethodReference[]>
> = Object.freeze({
  [VerificationType.Password]: [AuthenticationMethodReference.Password],
  [VerificationType.NewPasswordIdentity]: [AuthenticationMethodReference.Password],
  [VerificationType.EmailVerificationCode]: [AuthenticationMethodReference.Otp],
  [VerificationType.OneTimeToken]: [AuthenticationMethodReference.Otp],
  [VerificationType.TOTP]: [AuthenticationMethodReference.Otp],
  [VerificationType.MfaEmailVerificationCode]: [AuthenticationMethodReference.Otp],
  [VerificationType.BackupCode]: [AuthenticationMethodReference.Otp],
  [VerificationType.PhoneVerificationCode]: [AuthenticationMethodReference.Sms],
  [VerificationType.MfaPhoneVerificationCode]: [AuthenticationMethodReference.Sms],
  [VerificationType.WebAuthn]: [
    AuthenticationMethodReference.ProofOfPossession,
    AuthenticationMethodReference.UserPresence,
    AuthenticationMethodReference.Mfa,
  ],
  [VerificationType.SignInPasskey]: [
    AuthenticationMethodReference.ProofOfPossession,
    AuthenticationMethodReference.UserPresence,
    AuthenticationMethodReference.Mfa,
  ],
  [VerificationType.Social]: [AuthenticationMethodReference.Federated],
  [VerificationType.EnterpriseSso]: [AuthenticationMethodReference.Federated],
});

/** The AMR values a verification type contributes; see {@link authenticationMethodReferences}. */
export const getAuthenticationMethodReferences = (
  type: VerificationType
): readonly AuthenticationMethodReference[] => authenticationMethodReferences[type];

/**
 * Build the `amr` claim for the verification types that authenticated the user: the union of each
 * type's references in first-seen order, with `mfa` always last when any type carries it.
 */
export const buildAuthenticationMethodReferences = (
  types: Iterable<VerificationType>
): AuthenticationMethodReference[] => {
  const references = [
    ...new Set([...types].flatMap((type) => getAuthenticationMethodReferences(type))),
  ];
  const hasMfa = references.includes(AuthenticationMethodReference.Mfa);

  return [
    ...references.filter((reference) => reference !== AuthenticationMethodReference.Mfa),
    ...(hasMfa ? [AuthenticationMethodReference.Mfa] : []),
  ];
};

/**
 * The ACR the `amr` claim achieved: `mfa` marks {@link LogtoAcr.Mfa}; any other reference except
 * `fed` is a factor Logto verified itself and reaches {@link LogtoAcr.FirstFactor}; a federated
 * assertion alone reaches no ACR.
 */
export const getAchievedAcr = (
  references: readonly AuthenticationMethodReference[]
): LogtoAcr | undefined => {
  if (references.includes(AuthenticationMethodReference.Mfa)) {
    return LogtoAcr.Mfa;
  }

  return references.some((reference) => reference !== AuthenticationMethodReference.Federated)
    ? LogtoAcr.FirstFactor
    : undefined;
};
