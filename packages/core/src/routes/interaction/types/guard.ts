import { emailRegEx, phoneRegEx, validateRedirectUrl } from '@logto/core-kit';
import { eventGuard, profileGuard, InteractionEvent } from '@logto/schemas';
import { z } from 'zod';

import { socialUserInfoGuard } from '#src/connectors/types.js';

// Passcode Send Route Payload Guard
export const sendPasscodePayloadGuard = z.union([
  z.object({
    email: z.string().regex(emailRegEx),
  }),
  z.object({
    phone: z.string().regex(phoneRegEx),
  }),
]);

// Social Authorization Uri Route Payload Guard
export const socialAuthorizationUrlPayloadGuard = z.object({
  connectorId: z.string(),
  state: z.string(),
  redirectUri: z.string().refine((url) => validateRedirectUrl(url, 'web')),
});

// Identifier Guard
export const accountIdIdentifierGuard = z.object({
  key: z.literal('accountId'),
  value: z.string(),
});

export const verifiedEmailIdentifierGuard = z.object({
  key: z.literal('emailVerified'),
  value: z.string(),
});

export const verifiedPhoneIdentifierGuard = z.object({
  key: z.literal('phoneVerified'),
  value: z.string(),
});

export const socialIdentifierGuard = z.object({
  key: z.literal('social'),
  connectorId: z.string(),
  userInfo: socialUserInfoGuard,
});

export const identifierGuard = z.discriminatedUnion('key', [
  accountIdIdentifierGuard,
  verifiedEmailIdentifierGuard,
  verifiedPhoneIdentifierGuard,
  socialIdentifierGuard,
]);

export const anonymousInteractionResultGuard = z.object({
  event: eventGuard,
  profile: profileGuard.optional(),
  accountId: z.string().optional(),
  identifiers: z.array(identifierGuard).optional(),
});

export const verifiedRegisterInteractionResultGuard = z.object({
  event: z.literal(InteractionEvent.Register),
  profile: profileGuard.optional(),
  identifiers: z.array(identifierGuard).optional(),
});

export const verifiedSignInteractionResultGuard = z.object({
  event: z.literal(InteractionEvent.SignIn),
  accountId: z.string(),
  profile: profileGuard.optional(),
  identifiers: z.array(identifierGuard),
});

export const forgotPasswordProfileGuard = z.object({
  password: z.string(),
});

export const verifiedForgotPasswordInteractionResultGuard = z.object({
  event: z.literal(InteractionEvent.ForgotPassword),
  accountId: z.string(),
  identifiers: z.array(identifierGuard),
  profile: forgotPasswordProfileGuard,
});
