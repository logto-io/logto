/**
 * @file The authoritative vocabulary for the authentication context Logto records on a sign-in or
 * step-up: the supported Authentication Context Class Reference (ACR) values, their satisfaction
 * relation, and the Authentication Methods References (AMR) each verification contributes.
 *
 * @see {@link https://openid.net/specs/openid-connect-core-1_0.html#IDToken | OpenID Connect Core `acr` / `amr`}
 * @see {@link https://www.rfc-editor.org/rfc/rfc8176.html | RFC 8176 Authentication Method Reference Values}
 */
import { VerificationType } from './verification-records/verification-type.js';

/** The Logto-defined ACR values. Only these can be requested through `acr_values`. */
export enum LogtoAcr {
  /**
   * At least one active factor that Logto can directly verify: password, the user's primary
   * email / phone verification code, or an enrolled MFA factor. Social and enterprise SSO never
   * satisfy this class.
   */
  FirstFactor = 'urn:logto:acr:1fa',
  /**
   * A Logto-verifiable {@link LogtoAcr.FirstFactor} context plus an `mfa`-class record from a
   * different factor, or WebAuthn / passkey with required user verification alone.
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
  /** Multiple-factor authentication; appended whenever the achieved ACR is {@link LogtoAcr.Mfa}. */
  Mfa = 'mfa',
  /** Federated authentication assertion from a social or enterprise SSO provider. */
  Federated = 'fed',
}

/** The class a verification record contributes toward an ACR. */
export enum AuthenticationFactorClass {
  /** Contributes {@link LogtoAcr.FirstFactor}. */
  FirstFactor = '1fa',
  /**
   * Contributes an `mfa`-class record. Combined with a {@link AuthenticationFactorClass.FirstFactor}
   * record from a different factor it reaches {@link LogtoAcr.Mfa}; alone it reaches only
   * {@link LogtoAcr.FirstFactor}, except WebAuthn / passkey with required user verification.
   */
  Mfa = 'mfa',
}

/**
 * The class each verification type contributes: `1fa`-class, `mfa`-class, or `undefined` for
 * social / enterprise SSO, which contribute `fed` to AMR but nothing to the ACR.
 *
 * The record is keyed by every {@link VerificationType}, so a new type fails at compile time until
 * it is mapped here. Whether a WebAuthn assertion actually required user verification is decided at
 * derivation time; this table only says which class the type can contribute.
 */
const authenticationFactorClasses: Readonly<
  Record<VerificationType, AuthenticationFactorClass | undefined>
> = Object.freeze({
  [VerificationType.Password]: AuthenticationFactorClass.FirstFactor,
  [VerificationType.EmailVerificationCode]: AuthenticationFactorClass.FirstFactor,
  [VerificationType.PhoneVerificationCode]: AuthenticationFactorClass.FirstFactor,
  [VerificationType.OneTimeToken]: AuthenticationFactorClass.FirstFactor,
  // A password established in this interaction counts as a verified first factor.
  [VerificationType.NewPasswordIdentity]: AuthenticationFactorClass.FirstFactor,
  [VerificationType.TOTP]: AuthenticationFactorClass.Mfa,
  [VerificationType.MfaEmailVerificationCode]: AuthenticationFactorClass.Mfa,
  [VerificationType.MfaPhoneVerificationCode]: AuthenticationFactorClass.Mfa,
  [VerificationType.BackupCode]: AuthenticationFactorClass.Mfa,
  [VerificationType.WebAuthn]: AuthenticationFactorClass.Mfa,
  [VerificationType.SignInPasskey]: AuthenticationFactorClass.Mfa,
  [VerificationType.Social]: undefined,
  [VerificationType.EnterpriseSso]: undefined,
});

/** Classify a verification type; see {@link authenticationFactorClasses}. */
export const getAuthenticationFactorClass = (
  type: VerificationType
): AuthenticationFactorClass | undefined => authenticationFactorClasses[type];

/**
 * The AMR values a single verification type contributes, per the step-up tech design. The record
 * is keyed by every {@link VerificationType}, so a new type fails at compile time until it is
 * mapped here.
 *
 * The trailing `mfa` marker for an achieved {@link LogtoAcr.Mfa} is added by
 * {@link buildAuthenticationMethodReferences}, not here; WebAuthn carries it inherently because a
 * user-verified passkey is a multi-factor authenticator on its own.
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
 * Build the `amr` claim for a set of counted verification types and the ACR they achieved:
 * the union of each type's references in first-seen order, with `mfa` always last, present
 * whenever a counted type carries it (WebAuthn) or the achieved ACR is {@link LogtoAcr.Mfa}.
 */
export const buildAuthenticationMethodReferences = (
  types: Iterable<VerificationType>,
  achievedAcr?: LogtoAcr
): AuthenticationMethodReference[] => {
  const references = [...types].flatMap((type) => getAuthenticationMethodReferences(type));
  const hasMfa =
    achievedAcr === LogtoAcr.Mfa || references.includes(AuthenticationMethodReference.Mfa);

  return [
    ...new Set(references.filter((reference) => reference !== AuthenticationMethodReference.Mfa)),
    ...(hasMfa ? [AuthenticationMethodReference.Mfa] : []),
  ];
};
