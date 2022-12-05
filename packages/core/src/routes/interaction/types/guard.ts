import { emailRegEx, phoneRegEx, validateRedirectUrl } from '@logto/core-kit';
import {
  usernamePasswordPayloadGuard,
  emailPasscodePayloadGuard,
  phonePasscodePayloadGuard,
  socialConnectorPayloadGuard,
  eventGuard,
  profileGuard,
  identifierPayloadGuard,
  Event,
} from '@logto/schemas';
import { z } from 'zod';

import { socialUserInfoGuard } from '#src/connectors/types.js';

// Interaction Payload Guard
const forgotPasswordInteractionPayloadGuard = z.object({
  event: z.literal(Event.ForgotPassword),
  identifier: z.union([emailPasscodePayloadGuard, phonePasscodePayloadGuard]).optional(),
  profile: z.object({ password: z.string() }).optional(),
});

const registerInteractionPayloadGuard = z.object({
  event: z.literal(Event.Register),
  identifier: z.union([emailPasscodePayloadGuard, phonePasscodePayloadGuard]).optional(),
  profile: profileGuard,
});

const signInInteractionPayloadGuard = z.object({
  event: z.literal(Event.SignIn),
  identifier: identifierPayloadGuard.optional(),
  profile: profileGuard.optional(),
});

export const interactionPayloadGuard = z.discriminatedUnion('event', [
  signInInteractionPayloadGuard,
  registerInteractionPayloadGuard,
  forgotPasswordInteractionPayloadGuard,
]);

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

// Social Authorization Uri Route Payload Guard
export const getSocialAuthorizationUrlPayloadGuard = z.object({
  connectorId: z.string(),
  state: z.string(),
  redirectUri: z.string().refine((url) => validateRedirectUrl(url, 'web')),
});
// Register Profile Guard
const emailProfileGuard = emailPasscodePayloadGuard.pick({ email: true });
const phoneProfileGuard = phonePasscodePayloadGuard.pick({ phone: true });
const socialProfileGuard = socialConnectorPayloadGuard.pick({ connectorId: true });

export const registerProfileSafeGuard = z.union([
  usernamePasswordPayloadGuard.merge(profileGuard.omit({ username: true, password: true })),
  emailProfileGuard.merge(profileGuard.omit({ email: true })),
  phoneProfileGuard.merge(profileGuard.omit({ phone: true })),
  socialProfileGuard.merge(profileGuard.omit({ connectorId: true })),
]);

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
  event: z.literal(Event.Register),
  profile: registerProfileSafeGuard,
  identifiers: z.array(identifierGuard).optional(),
});

export const verifiedSignInteractionResultGuard = z.object({
  event: z.literal(Event.SignIn),
  accountId: z.string(),
  profile: profileGuard.optional(),
  identifiers: z.array(identifierGuard).optional(),
});

export const forgotPasswordProfileGuard = z.object({
  password: z.string(),
});

export const verifiedForgotPasswordInteractionResultGuard = z.object({
  event: z.literal(Event.ForgotPassword),
  accountId: z.string(),
  profile: forgotPasswordProfileGuard,
});
