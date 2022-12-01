import { emailRegEx, phoneRegEx, validateRedirectUrl } from '@logto/core-kit';
import type {
  UsernamePasswordPayload,
  EmailPasswordPayload,
  EmailPasscodePayload,
  PhonePasswordPayload,
  PhonePasscodePayload,
} from '@logto/schemas';
import {
  usernamePasswordPayloadGuard,
  emailPasscodePayloadGuard,
  phonePasscodePayloadGuard,
  socialConnectorPayloadGuard,
  eventGuard,
  profileGuard,
  identifierGuard,
  Event,
} from '@logto/schemas';
import { z } from 'zod';

// Interaction Route Guard
const forgotPasswordInteractionPayloadGuard = z.object({
  event: z.literal(Event.ForgotPassword),
  identifier: z.union([emailPasscodePayloadGuard, phonePasscodePayloadGuard]).optional(),
  profile: z.object({ password: z.string() }).optional(),
});

const registerInteractionPayloadGuard = z.object({
  event: z.literal(Event.Register),
  identifier: z.union([emailPasscodePayloadGuard, phonePasscodePayloadGuard]).optional(),
  profile: profileGuard.optional(),
});

const signInInteractionPayloadGuard = z.object({
  event: z.literal(Event.SignIn),
  identifier: identifierGuard.optional(),
  profile: profileGuard.optional(),
});

export const interactionPayloadGuard = z.discriminatedUnion('event', [
  signInInteractionPayloadGuard,
  registerInteractionPayloadGuard,
  forgotPasswordInteractionPayloadGuard,
]);

export type InteractionPayload = z.infer<typeof interactionPayloadGuard>;
export type IdentifierPayload = z.infer<typeof identifierGuard>;

export type PasswordIdentifierPayload =
  | UsernamePasswordPayload
  | EmailPasswordPayload
  | PhonePasswordPayload;

export type PasscodeIdentifierPayload = EmailPasscodePayload | PhonePasscodePayload;

// Passcode Send Route Payload Guard
export const sendPasscodePayloadGuard = z.union([
  z.object({
    event: eventGuard,
    email: z.string().regex(emailRegEx),
  }),
  z.object({
    event: eventGuard,
    phone: z.string().regex(phoneRegEx),
  }),
]);
export type SendPasscodePayload = z.infer<typeof sendPasscodePayloadGuard>;

// Social Authorization Uri Route Payload Guard
export const getSocialAuthorizationUrlPayloadGuard = z.object({
  connectorId: z.string(),
  state: z.string(),
  redirectUri: z.string().refine((url) => validateRedirectUrl(url, 'web')),
});
export type SocialAuthorizationUrlPayload = z.infer<typeof getSocialAuthorizationUrlPayloadGuard>;

// Register Profile Guard
const emailProfileGuard = emailPasscodePayloadGuard.pick({ email: true });
const phoneProfileGuard = phonePasscodePayloadGuard.pick({ phone: true });
const socialProfileGuard = socialConnectorPayloadGuard.pick({ connectorId: true });

export const registerProfileSafeGuard = z.union([
  usernamePasswordPayloadGuard,
  emailProfileGuard,
  phoneProfileGuard,
  socialProfileGuard,
]);
