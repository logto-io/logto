/**
 * @file The authoritative vocabulary for the authentication context Logto records on a sign-in or
 * step-up: the supported Authentication Context Class Reference (ACR) values, their satisfaction
 * relation, and the Authentication Methods References (AMR) each verification contributes.
 *
 * @see {@link https://openid.net/specs/openid-connect-core-1_0.html#IDToken | OpenID Connect Core `acr` / `amr`}
 * @see {@link https://www.rfc-editor.org/rfc/rfc8176.html | RFC 8176 Authentication Method Reference Values}
 */
import { z } from 'zod';

import { type ToZodObject } from '../utils/zod.js';

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

/**
 * The role a proof can fill when proofs are combined into an ACR. This is not the ACR a proof
 * reaches on its own: any proof with a class reaches {@link LogtoAcr.FirstFactor} alone, and the
 * class only decides which side of the pair the proof can stand on when
 * {@link LogtoAcr.Mfa} is derived. That level needs a `1fa`-role proof and an `mfa`-role proof of
 * two different factors, so two `mfa`-class factors, such as a TOTP and a backup code, never reach
 * it together.
 */
export enum AuthenticationFactorClass {
  /** Fills the `1fa` role: a password or a primary email / phone code. */
  FirstFactor = '1fa',
  /**
   * Fills the `mfa` role: TOTP, a backup code or an MFA email / phone code. Alone it reaches
   * {@link LogtoAcr.FirstFactor}; paired with a `1fa`-role proof of a different factor it reaches
   * {@link LogtoAcr.Mfa}.
   */
  Mfa = 'mfa',
  /**
   * Fills both roles by itself, so it reaches {@link LogtoAcr.Mfa} alone: a user-verified WebAuthn
   * authenticator is possession plus user verification in one act. Kept as a class rather than a
   * special case on the factor so that every "can fill this role" check stays a class comparison
   * and this table stays the single place that decides.
   */
  Both = 'both',
}

/**
 * The class each verification type contributes: `1fa`-class, `mfa`-class, `both`, or `undefined`
 * for social / enterprise SSO, which contribute `fed` to AMR but nothing to the ACR.
 *
 * The record is keyed by every {@link VerificationType}, so a new type fails at compile time until
 * it is mapped here. Logto requires user verification for every WebAuthn ceremony, registration and
 * authentication alike, so a verified WebAuthn record is user-verified by construction.
 */
const authenticationFactorClasses: Readonly<
  Record<VerificationType, AuthenticationFactorClass | undefined>
> = Object.freeze({
  [VerificationType.Password]: AuthenticationFactorClass.FirstFactor,
  [VerificationType.EmailVerificationCode]: AuthenticationFactorClass.FirstFactor,
  [VerificationType.PhoneVerificationCode]: AuthenticationFactorClass.FirstFactor,
  [VerificationType.OneTimeToken]: AuthenticationFactorClass.FirstFactor,
  // A password established by a registration; it is a proof once `createUser()` consumes it.
  [VerificationType.NewPasswordIdentity]: AuthenticationFactorClass.FirstFactor,
  [VerificationType.TOTP]: AuthenticationFactorClass.Mfa,
  [VerificationType.MfaEmailVerificationCode]: AuthenticationFactorClass.Mfa,
  [VerificationType.MfaPhoneVerificationCode]: AuthenticationFactorClass.Mfa,
  [VerificationType.BackupCode]: AuthenticationFactorClass.Mfa,
  [VerificationType.WebAuthn]: AuthenticationFactorClass.Both,
  [VerificationType.SignInPasskey]: AuthenticationFactorClass.Both,
  [VerificationType.Social]: undefined,
  [VerificationType.EnterpriseSso]: undefined,
});

/** Classify a verification type; see {@link authenticationFactorClasses}. */
export const getAuthenticationFactorClass = (
  type: VerificationType
): AuthenticationFactorClass | undefined => authenticationFactorClasses[type];

/**
 * The factor a verification record is a proof of. Repeated proofs of one factor count once, and
 * {@link LogtoAcr.Mfa} needs a `1fa`-class and an `mfa`-class proof of two different factors: a
 * one-time token and an MFA email code are two proofs of the same mailbox, not two factors.
 */
export enum AuthenticationFactor {
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

/** The factor a verification type is a proof of; see {@link authenticationFactors}. */
export const getAuthenticationFactor = (type: VerificationType): AuthenticationFactor =>
  authenticationFactors[type];

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
 * Build the `amr` claim from the references each counted proof contributes and the ACR they
 * achieved: the union in first-seen order, with `mfa` always last, present whenever a proof carries
 * it (WebAuthn) or the achieved ACR is {@link LogtoAcr.Mfa}.
 */
export const buildAuthenticationMethodReferences = (
  references: Iterable<readonly AuthenticationMethodReference[]>,
  achievedAcr?: LogtoAcr
): AuthenticationMethodReference[] => {
  const flattened = [...references].flat();
  const hasMfa =
    achievedAcr === LogtoAcr.Mfa || flattened.includes(AuthenticationMethodReference.Mfa);

  return [
    ...new Set(flattened.filter((reference) => reference !== AuthenticationMethodReference.Mfa)),
    ...(hasMfa ? [AuthenticationMethodReference.Mfa] : []),
  ];
};

/**
 * Why a proof was recorded: the touchpoint that consumed the credential. Aggregation into `acr` /
 * `amr` ignores the role; it exists for the MFA gate and for step-up freshness, and never reaches
 * a token.
 */
export enum AuthenticationProofRole {
  /** `createUser()` created the account from the record. */
  Create = 'create',
  /** `identifyUser()` identified the user with the record. */
  Identify = 'identify',
  /** The credential or factor was written to the account by this interaction. */
  Bind = 'bind',
  /** An MFA challenge was answered with the record. */
  Mfa = 'mfa',
}

/**
 * A proof that the identified user authenticated in the interaction, recorded at the single
 * touchpoint that consumed the credential. What counts is decided where the interaction relies on
 * the credential, never by inspecting verification records afterwards.
 */
export type AuthenticationProof = {
  /** The verification record id, or `password` for a password established through the profile. */
  id: string;
  factor: AuthenticationFactor;
  /** Absent for a federated proof, which contributes `fed` to AMR and nothing to the ACR. */
  class?: AuthenticationFactorClass;
  amr: AuthenticationMethodReference[];
  role: AuthenticationProofRole;
};

export const authenticationProofGuard = z.object({
  id: z.string().min(1),
  factor: z.nativeEnum(AuthenticationFactor),
  class: z.nativeEnum(AuthenticationFactorClass).optional(),
  amr: z.nativeEnum(AuthenticationMethodReference).array().min(1),
  role: z.nativeEnum(AuthenticationProofRole),
}) satisfies ToZodObject<AuthenticationProof>;
