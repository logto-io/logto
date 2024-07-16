import { emailRegEx, phoneRegEx, usernameRegEx } from '@logto/core-kit';
import { z } from 'zod';

import { MfaFactor, jsonObjectGuard, webAuthnTransportGuard } from '../foundations/index.js';
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

// ====== Experience API payload guards and type definitions start ======
export enum InteractionIdentifierType {
  Username = 'username',
  Email = 'email',
  Phone = 'phone',
}

/** Identifiers that can be used to uniquely identify a user. */
export type InteractionIdentifier = {
  type: InteractionIdentifierType;
  value: string;
};

export const interactionIdentifierGuard = z.object({
  type: z.nativeEnum(InteractionIdentifierType),
  value: z.string(),
}) satisfies ToZodObject<InteractionIdentifier>;

/** Currently only email and phone are supported for verification code validation. */
export type VerificationCodeIdentifier = {
  type: InteractionIdentifierType.Email | InteractionIdentifierType.Phone;
  value: string;
};

export const verificationCodeIdentifierGuard = z.object({
  type: z.enum([InteractionIdentifierType.Email, InteractionIdentifierType.Phone]),
  value: z.string(),
}) satisfies ToZodObject<VerificationCodeIdentifier>;

/** Logto supported interaction verification types. */
export enum VerificationType {
  Password = 'Password',
  VerificationCode = 'VerificationCode',
  Social = 'Social',
  EnterpriseSso = 'EnterpriseSso',
  TOTP = 'Totp',
  WebAuthn = 'WebAuthn',
  BackupCode = 'BackupCode',
}

// REMARK: API payload guard

/** Payload type for `POST /api/experience/verification/social/:connectorId/authorization-uri`. */
export type SocialAuthorizationUrlPayload = {
  state: string;
  redirectUri: string;
};
export const socialAuthorizationUrlPayloadGuard = z.object({
  state: z.string(),
  redirectUri: z.string(),
}) satisfies ToZodObject<SocialAuthorizationUrlPayload>;

/** Payload type for `POST /api/experience/verification/social/:connectorId/verify`. */
export type SocialVerificationCallbackPayload = {
  /** The callback data from the social connector. */
  connectorData: Record<string, unknown>;
  /**  The verification ID returned from the authorization URI. */
  verificationId: string;
};
export const socialVerificationCallbackPayloadGuard = z.object({
  connectorData: jsonObjectGuard,
  verificationId: z.string(),
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

/** Payload type for `POST /api/experience/identification`. */
export type IdentificationApiPayload = {
  interactionEvent: InteractionEvent;
  verificationId: string;
};

export const identificationApiPayloadGuard = z.object({
  interactionEvent: z.nativeEnum(InteractionEvent),
  verificationId: z.string(),
}) satisfies ToZodObject<IdentificationApiPayload>;

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

export const totpVerificationPayloadGuard = bindTotpPayloadGuard;

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

// Some information like TOTP secret should be generated in the backend
// and stored in the interaction temporarily.
export const pendingMfaGuard = z.discriminatedUnion('type', [
  pendingTotpGuard,
  pendingWebAuthnGuard,
  pendingBackupCodeGuard,
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
