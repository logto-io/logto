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
  email: z.string().min(1),
  passcode: z.string().min(1),
});
export type EmailPasscodePayload = z.infer<typeof emailPasscodePayloadGuard>;

export const phonePasscodePayloadGuard = z.object({
  phone: z.string().min(1),
  passcode: z.string().min(1),
});
export type PhonePasscodePayload = z.infer<typeof phonePasscodePayloadGuard>;

export const socialConnectorPayloadGuard = z.object({
  connectorId: z.string(),
  connectorData: z.unknown(),
});
export type SocialConnectorPayload = z.infer<typeof socialConnectorPayloadGuard>;

/**
 * Interaction Payload Guard
 */
export const eventGuard = z.union([
  z.literal('sign-in'),
  z.literal('register'),
  z.literal('forgot-password'),
]);

export type Event = z.infer<typeof eventGuard>;

export const identifierGuard = z.object({
  username: z.string().min(1).optional(),
  email: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  connectorId: z.string().min(1).optional(),
  password: z.string().min(1).optional(),
  passcode: z.string().min(1).optional(),
  connectorData: z.unknown().optional(),
});

export const profileGuard = z.object({
  username: z.string().regex(usernameRegEx).optional(),
  email: z.string().regex(emailRegEx).optional(),
  phone: z.string().regex(phoneRegEx).optional(),
  connectorId: z.string().optional(),
  password: z.string().regex(passwordRegEx).optional(),
});

export type Profile = z.infer<typeof profileGuard>;
