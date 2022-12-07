import { emailRegEx, phoneRegEx, usernameRegEx, passwordRegEx } from '@logto/core-kit';
import { z } from 'zod';

/**
 * Detailed Identifier Methods guard
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

export const emailPasscodePayloadGuard = z.object({
  email: z.string().regex(emailRegEx),
  passcode: z.string().min(1),
});
export type EmailPasscodePayload = z.infer<typeof emailPasscodePayloadGuard>;

export const phonePasscodePayloadGuard = z.object({
  phone: z.string().regex(phoneRegEx),
  passcode: z.string().min(1),
});
export type PhonePasscodePayload = z.infer<typeof phonePasscodePayloadGuard>;

export const socialConnectorPayloadGuard = z.object({
  connectorId: z.string(),
  connectorData: z.unknown(),
});
export type SocialConnectorPayload = z.infer<typeof socialConnectorPayloadGuard>;

export const socialIdentityPayloadGuard = z.object({
  connectorId: z.string(),
  identityType: z.union([z.literal('phone'), z.literal('email')]),
});
export type SocialIdentityPayload = z.infer<typeof socialIdentityPayloadGuard>;

/**
 * Interaction Payload Guard
 */
export enum Event {
  SignIn = 'SignIn',
  Register = 'Register',
  ForgotPassword = 'ForgotPassword',
}

export const eventGuard = z.nativeEnum(Event);

export const identifierPayloadGuard = z.union([
  usernamePasswordPayloadGuard,
  emailPasswordPayloadGuard,
  phonePasswordPayloadGuard,
  emailPasscodePayloadGuard,
  phonePasscodePayloadGuard,
  socialConnectorPayloadGuard,
  socialIdentityPayloadGuard,
]);

export type IdentifierPayload =
  | UsernamePasswordPayload
  | EmailPasswordPayload
  | PhonePasswordPayload
  | EmailPasscodePayload
  | PhonePasscodePayload
  | SocialConnectorPayload
  | SocialIdentityPayload;

export const profileGuard = z.object({
  username: z.string().regex(usernameRegEx).optional(),
  email: z.string().regex(emailRegEx).optional(),
  phone: z.string().regex(phoneRegEx).optional(),
  connectorId: z.string().optional(),
  password: z.string().regex(passwordRegEx).optional(),
});

export type Profile = z.infer<typeof profileGuard>;

export enum MissingProfile {
  username = 'username',
  email = 'email',
  phone = 'phone',
  password = 'password',
  emailOrPhone = 'emailOrPhone',
}
