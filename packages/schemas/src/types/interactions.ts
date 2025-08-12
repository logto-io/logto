/* eslint-disable max-lines */
import { emailRegEx, numberAndAlphabetRegEx, phoneRegEx, usernameRegEx } from '@logto/core-kit';
import { z } from 'zod';

import {
  AdditionalIdentifier,
  MfaFactor,
  SignInIdentifier,
  jsonObjectGuard,
  webAuthnTransportGuard,
} from '../foundations/index.js';
import { type ToZodObject } from '../utils/zod.js';

import type {
  EmailVerificationCodePayload,
  PhoneVerificationCodePayload,
} from './verification-code.js';
import {
  emailVerificationCodePayloadGuard,
  phoneVerificationCodePayloadGuard,
} from './verification-code.js';

/**
 * User interaction events defined in Logto RFC 0004.
 * @see {@link https://github.com/logto-io/rfcs | Logto RFCs} for more information.
 */
export enum InteractionEvent {
  SignIn = 'SignIn',
  Register = 'Register',
  ForgotPassword = 'ForgotPassword',
}

export type VerificationIdentifier = {
  type: SignInIdentifier | AdditionalIdentifier;
  value: string;
};

export const verificationIdentifierGuard = z.object({
  type: z.union([z.nativeEnum(SignInIdentifier), z.nativeEnum(AdditionalIdentifier)]),
  value: z.string(),
}) satisfies ToZodObject<VerificationIdentifier>;

// ====== Experience API payload guards and type definitions start ======

/** Identifiers that can be used to uniquely identify a user. */
export type InteractionIdentifier<T extends SignInIdentifier = SignInIdentifier> = {
  type: T;
  value: string;
};

export const interactionIdentifierGuard = z.object({
  type: z.nativeEnum(SignInIdentifier),
  value: z.string(),
}) satisfies ToZodObject<InteractionIdentifier>;

export type VerificationCodeSignInIdentifier = SignInIdentifier.Email | SignInIdentifier.Phone;

/** Currently only email and phone are supported for verification code validation. */
export type VerificationCodeIdentifier<
  T extends VerificationCodeSignInIdentifier = VerificationCodeSignInIdentifier,
> = {
  type: T;
  value: string;
};
export const verificationCodeIdentifierGuard = z.object({
  type: z.enum([SignInIdentifier.Email, SignInIdentifier.Phone]),
  value: z.string(),
}) satisfies ToZodObject<VerificationCodeIdentifier>;

// REMARK: API payload guard

/** Payload type for `POST /api/experience/verification/{social|sso}/:connectorId/authorization-uri`. */
export type SocialAuthorizationUrlPayload = {
  state: string;
  redirectUri: string;
  scope?: string;
};
export const socialAuthorizationUrlPayloadGuard = z.object({
  state: z.string(),
  redirectUri: z.string(),
  scope: z.string().optional(),
}) satisfies ToZodObject<SocialAuthorizationUrlPayload>;

/** Payload type for `POST /api/experience/verification/{social|sso}/:connectorId/verify`. */
export type SocialVerificationCallbackPayload = {
  /** The callback data from the social connector. */
  connectorData: Record<string, unknown>;
  /**
   * Verification ID is used to retrieve the verification record.
   * Throws an error if the verification record is not found.
   *
   * Optional for Google one tap callback as it does not have a pre-created verification record.
   **/
  verificationId?: string;
};
export const socialVerificationCallbackPayloadGuard = z.object({
  connectorData: jsonObjectGuard,
  verificationId: z.string().optional(),
}) satisfies ToZodObject<SocialVerificationCallbackPayload>;

/** Payload type for `POST /api/experience/verification/password`. */
export type PasswordVerificationPayload = {
  identifier: InteractionIdentifier;
  password: string;
};
export const passwordVerificationPayloadGuard = z.object({
  identifier: interactionIdentifierGuard,
  password: z.string().min(1),
}) satisfies ToZodObject<PasswordVerificationPayload>;

/** Payload type for `POST /api/experience/verification/totp/verify`. */
export type TotpVerificationVerifyPayload = {
  code: string;
  /**
   * Required for verifying the newly created TOTP secret verification record in the session.
   * (For new TOTP setup use only)
   *
   * If not provided, a new TOTP verification will be generated and validated against the user's existing TOTP secret in their profile.
   * (For existing TOTP verification use only)
   */
  verificationId?: string;
};
export const totpVerificationVerifyPayloadGuard = z.object({
  code: z.string().min(1),
  verificationId: z.string().optional(),
}) satisfies ToZodObject<TotpVerificationVerifyPayload>;

/** Payload type for `POST /api/experience/verification/backup-code/verify */
export type BackupCodeVerificationVerifyPayload = {
  code: string;
};
export const backupCodeVerificationVerifyPayloadGuard = z.object({
  code: z.string().min(1),
}) satisfies ToZodObject<BackupCodeVerificationVerifyPayload>;

/** Payload type for `POST /api/experience/verification/one-time-token/verify` */
export type OneTimeTokenVerificationVerifyPayload = {
  /**
   * The email address that the one-time token was sent to. Currently only email identifier is supported.
   */
  identifier: InteractionIdentifier<SignInIdentifier.Email>;
  token: string;
};
export const oneTimeTokenVerificationVerifyPayloadGuard = z.object({
  identifier: z.object({
    type: z.literal(SignInIdentifier.Email),
    value: z.string().regex(emailRegEx),
  }),
  token: z.string().min(1),
}) satisfies ToZodObject<OneTimeTokenVerificationVerifyPayload>;

/** Payload type for `POST /api/experience/identification`. */
export type IdentificationApiPayload = {
  /**
   * SignIn and ForgotPassword interaction events:
   * Required to retrieve the verification record to validate the user's identity.
   *
   * Register interaction event:
   *  - If provided, new user profiles will be appended to the registration session using the verified information from the verification record.
   *  - If not provided, the user creation process will be triggered directly using the existing profile information in the current registration session.
   */
  verificationId?: string;
  /**
   * Link social identity to a related user account with the same email or phone.
   * Only applicable for social verification records and a related user account is found.
   */
  linkSocialIdentity?: boolean;
};
export const identificationApiPayloadGuard = z.object({
  verificationId: z.string().optional(),
  linkSocialIdentity: z.boolean().optional(),
}) satisfies ToZodObject<IdentificationApiPayload>;

/** Payload type for `POST /api/experience`. */
export type CreateExperienceApiPayload = {
  interactionEvent: InteractionEvent;
  captchaToken?: string;
};
export const CreateExperienceApiPayloadGuard = z.object({
  interactionEvent: z.nativeEnum(InteractionEvent),
  captchaToken: z.string().optional(),
}) satisfies ToZodObject<CreateExperienceApiPayload>;

/** Payload type for `POST /api/experience/profile */
export const updateProfileApiPayloadGuard = z.discriminatedUnion('type', [
  z.object({
    type: z.literal(SignInIdentifier.Username),
    value: z.string().regex(usernameRegEx),
  }),
  z.object({
    type: z.literal('password'),
    value: z.string(),
  }),
  z.object({
    type: z.literal(SignInIdentifier.Email),
    verificationId: z.string(),
  }),
  z.object({
    type: z.literal(SignInIdentifier.Phone),
    verificationId: z.string(),
  }),
  z.object({
    type: z.literal('social'),
    verificationId: z.string(),
  }),
  z.object({
    type: z.literal('extraProfile'),
    values: z.record(z.string().regex(numberAndAlphabetRegEx), z.unknown()),
  }),
]);
export type UpdateProfileApiPayload = z.infer<typeof updateProfileApiPayloadGuard>;

// ====== Experience API payload guard and types definitions end ======

/**
 * Legacy interaction identifier payload guard
 *
 * @remark
 * Following are the types for legacy interaction APIs. They are all treated as deprecated, and can be removed
 * once the new Experience API are fully implemented and migrated.
 * =================================================================================================================
 */

/**
 * Detailed interaction identifier payload guard
 */
const usernamePasswordPayloadGuard = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export type UsernamePasswordPayload = z.infer<typeof usernamePasswordPayloadGuard>;

export const emailPasswordPayloadGuard = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});
export type EmailPasswordPayload = z.infer<typeof emailPasswordPayloadGuard>;

export const phonePasswordPayloadGuard = z.object({
  phone: z.string().min(1),
  password: z.string().min(1),
});
export type PhonePasswordPayload = z.infer<typeof phonePasswordPayloadGuard>;

export const socialConnectorPayloadGuard = z.object({
  connectorId: z.string(),
  connectorData: jsonObjectGuard,
});
export type SocialConnectorPayload = z.infer<typeof socialConnectorPayloadGuard>;

export const socialEmailPayloadGuard = z.object({
  connectorId: z.string(),
  email: z.string(),
});

export type SocialEmailPayload = z.infer<typeof socialEmailPayloadGuard>;

export const socialPhonePayloadGuard = z.object({
  connectorId: z.string(),
  phone: z.string(),
});

export type SocialPhonePayload = z.infer<typeof socialPhonePayloadGuard>;

export const eventGuard = z.nativeEnum(InteractionEvent);

export const identifierPayloadGuard = z.union([
  usernamePasswordPayloadGuard,
  emailPasswordPayloadGuard,
  phonePasswordPayloadGuard,
  emailVerificationCodePayloadGuard,
  phoneVerificationCodePayloadGuard,
  socialConnectorPayloadGuard,
  socialEmailPayloadGuard,
  socialPhonePayloadGuard,
]);

export type IdentifierPayload =
  | UsernamePasswordPayload
  | EmailPasswordPayload
  | PhonePasswordPayload
  | EmailVerificationCodePayload
  | PhoneVerificationCodePayload
  | SocialConnectorPayload
  | SocialPhonePayload
  | SocialEmailPayload;

export const profileGuard = z.object({
  username: z.string().regex(usernameRegEx).optional(),
  email: z.string().regex(emailRegEx).optional(),
  phone: z.string().regex(phoneRegEx).optional(),
  connectorId: z.string().optional(),
  password: z.string().optional(),
});

export type Profile = z.infer<typeof profileGuard>;

export enum MissingProfile {
  username = 'username',
  email = 'email',
  phone = 'phone',
  password = 'password',
  emailOrPhone = 'emailOrPhone',
  extraProfile = 'extraProfile',
}

export const bindTotpPayloadGuard = z.object({
  // Unlike identifier payload which has indicator like "email",
  // mfa payload must have an additional type field to indicate type
  type: z.literal(MfaFactor.TOTP),
  code: z.string(),
});

export type BindTotpPayload = z.infer<typeof bindTotpPayloadGuard>;

export const bindWebAuthnPayloadGuard = z.object({
  type: z.literal(MfaFactor.WebAuthn),
  id: z.string(),
  rawId: z.string(),
  /**
   * The response from WebAuthn API
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredential}
   */
  response: z.object({
    clientDataJSON: z.string(),
    attestationObject: z.string(),
    authenticatorData: z.string().optional(),
    transports: webAuthnTransportGuard.array().optional(),
    publicKeyAlgorithm: z.number().optional(),
    publicKey: z.string().optional(),
  }),
  authenticatorAttachment: z.enum(['cross-platform', 'platform']).optional(),
  clientExtensionResults: z.object({
    appid: z.boolean().optional(),
    crepProps: z
      .object({
        rk: z.boolean().optional(),
      })
      .optional(),
    hmacCreateSecret: z.boolean().optional(),
  }),
});

export type BindWebAuthnPayload = z.infer<typeof bindWebAuthnPayloadGuard>;

export const bindBackupCodePayloadGuard = z.object({
  type: z.literal(MfaFactor.BackupCode),
});

export type BindBackupCodePayload = z.infer<typeof bindBackupCodePayloadGuard>;

export const bindMfaPayloadGuard = z.discriminatedUnion('type', [
  bindTotpPayloadGuard,
  bindWebAuthnPayloadGuard,
  bindBackupCodePayloadGuard,
]);

export type BindMfaPayload = z.infer<typeof bindMfaPayloadGuard>;

/** @deprecated  Legacy interaction API use only */
export const totpVerificationPayloadGuard = bindTotpPayloadGuard;

/** @deprecated Legacy interaction API use only */
export type TotpVerificationPayload = z.infer<typeof totpVerificationPayloadGuard>;

export const webAuthnVerificationPayloadGuard = bindWebAuthnPayloadGuard
  .omit({ response: true })
  .extend({
    response: z.object({
      clientDataJSON: z.string(),
      authenticatorData: z.string(),
      signature: z.string(),
      userHandle: z.string().optional(),
    }),
  });

export type WebAuthnVerificationPayload = z.infer<typeof webAuthnVerificationPayloadGuard>;

export const backupCodeVerificationPayloadGuard = z.object({
  type: z.literal(MfaFactor.BackupCode),
  code: z.string(),
});

export type BackupCodeVerificationPayload = z.infer<typeof backupCodeVerificationPayloadGuard>;

export const verifyMfaPayloadGuard = z.discriminatedUnion('type', [
  totpVerificationPayloadGuard,
  webAuthnVerificationPayloadGuard,
  backupCodeVerificationPayloadGuard,
]);

export type VerifyMfaPayload = z.infer<typeof verifyMfaPayloadGuard>;

export const pendingTotpGuard = z.object({
  type: z.literal(MfaFactor.TOTP),
  secret: z.string(),
});

export type PendingTotp = z.infer<typeof pendingTotpGuard>;

export const pendingWebAuthnGuard = z.object({
  type: z.literal(MfaFactor.WebAuthn),
  challenge: z.string(),
});

export type PendingWebAuthn = z.infer<typeof pendingWebAuthnGuard>;

export const pendingBackupCodeGuard = z.object({
  type: z.literal(MfaFactor.BackupCode),
  codes: z.array(z.string()),
});

export type PendingBackupCode = z.infer<typeof pendingBackupCodeGuard>;

export const pendingEmailVerificationCodeGuard = z.object({
  type: z.literal(MfaFactor.EmailVerificationCode),
  email: z.string(),
});

export type PendingEmailVerificationCode = z.infer<typeof pendingEmailVerificationCodeGuard>;

export const pendingPhoneVerificationCodeGuard = z.object({
  type: z.literal(MfaFactor.PhoneVerificationCode),
  phone: z.string(),
});

export type PendingPhoneVerificationCode = z.infer<typeof pendingPhoneVerificationCodeGuard>;

// Some information like TOTP secret should be generated in the backend
// and stored in the interaction temporarily.
export const pendingMfaGuard = z.discriminatedUnion('type', [
  pendingTotpGuard,
  pendingWebAuthnGuard,
  pendingBackupCodeGuard,
  pendingEmailVerificationCodeGuard,
  pendingPhoneVerificationCodeGuard,
]);

export type PendingMfa = z.infer<typeof pendingMfaGuard>;

export const bindTotpGuard = pendingTotpGuard;

export type BindTotp = z.infer<typeof bindTotpGuard>;

export const bindWebAuthnGuard = z.object({
  type: z.literal(MfaFactor.WebAuthn),
  credentialId: z.string(),
  publicKey: z.string(),
  transports: webAuthnTransportGuard.array(),
  counter: z.number(),
  agent: z.string(),
  name: z.string().optional(),
});

export type BindWebAuthn = z.infer<typeof bindWebAuthnGuard>;

export const bindBackupCodeGuard = pendingBackupCodeGuard;

export type BindBackupCode = z.infer<typeof bindBackupCodeGuard>;

// The type for binding new mfa verification to a user, not always equals to the pending type.
export const bindMfaGuard = z.discriminatedUnion('type', [
  bindTotpGuard,
  bindWebAuthnGuard,
  bindBackupCodeGuard,
]);

export type BindMfa = z.infer<typeof bindMfaGuard>;

export const verifyMfaResultGuard = z.object({
  type: z.nativeEnum(MfaFactor),
  id: z.string(),
});

export type VerifyMfaResult = z.infer<typeof verifyMfaResultGuard>;
/* eslint-enable max-lines */
