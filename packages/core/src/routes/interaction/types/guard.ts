import { emailRegEx, phoneRegEx, validateRedirectUrl } from '@logto/core-kit';
import type {
  UsernamePasswordPayload,
  EmailPasswordPayload,
  EmailPasscodePayload,
  PhonePasswordPayload,
  PhonePasscodePayload,
} from '@logto/schemas';
import { eventGuard, profileGuard, identifierGuard } from '@logto/schemas';
import { z } from 'zod';

// Interaction Route Guard
export const interactionPayloadGuard = z.object({
  event: eventGuard.optional(),
  identifier: identifierGuard.optional(),
  profile: profileGuard.optional(),
});

export type InteractionPayload = z.infer<typeof interactionPayloadGuard>;
export type IdentifierPayload = z.infer<typeof identifierGuard>;

export type PasswordIdentifierPayload =
  | UsernamePasswordPayload
  | EmailPasswordPayload
  | PhonePasswordPayload;

export type PasscodeIdentifierPayload = EmailPasscodePayload | PhonePasscodePayload;

// Passcode Send Route Guard
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

// Social Authorization Uri Route Guard
export const getSocialAuthorizationUrlPayloadGuard = z.object({
  connectorId: z.string(),
  state: z.string(),
  redirectUri: z.string().refine((url) => validateRedirectUrl(url, 'web')),
});

export type SocialAuthorizationUrlPayload = z.infer<typeof getSocialAuthorizationUrlPayloadGuard>;
