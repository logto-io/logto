import { emailRegEx, phoneRegEx, usernameRegEx } from '@logto/core-kit';
import { z } from 'zod';

import { MfaFactor, jsonObjectGuard } from '../foundations/index.js';

import type {
  EmailVerificationCodePayload,
  PhoneVerificationCodePayload,
} from './verification-code.js';
import {
  emailVerificationCodePayloadGuard,
  phoneVerificationCodePayloadGuard,
} from './verification-code.js';

/**
 * Detailed interaction identifier payload guard
 */
export const usernamePasswordPayloadGuard = z.object({
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

// Interaction flow event types
export enum InteractionEvent {
  SignIn = 'SignIn',
  Register = 'Register',
  ForgotPassword = 'ForgotPassword',
}

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

export const bindMfaPayloadGuard = bindTotpPayloadGuard;

export type BindMfaPayload = z.infer<typeof bindMfaPayloadGuard>;

export const pendingTotpGuard = z.object({
  type: z.literal(MfaFactor.TOTP),
  secret: z.string(),
});

export type PendingTotp = z.infer<typeof pendingTotpGuard>;

// Some information like TOTP secret should be generated in the backend
// and stored in the interaction temporarily.
export const pendingMfaGuard = pendingTotpGuard;

export type PendingMfa = z.infer<typeof pendingMfaGuard>;

export const bindTotpGuard = pendingTotpGuard;

export type BindTotp = z.infer<typeof bindTotpGuard>;

// The type for binding new mfa verification to a user, not always equals to the pending type.
export const bindMfaGuard = bindTotpGuard;

export type BindMfa = z.infer<typeof bindMfaGuard>;
