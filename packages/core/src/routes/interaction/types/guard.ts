import { socialUserInfoGuard } from '@logto/connector-kit';
import { validateRedirectUrl } from '@logto/core-kit';
import { bindMfaGuard, eventGuard, pendingMfaGuard, profileGuard } from '@logto/schemas';
import { z } from 'zod';

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
  // The new mfa to be bound to the account
  bindMfa: bindMfaGuard.optional(),
  // The pending mfa info, such as secret of TOTP
  pendingMfa: pendingMfaGuard.optional(),
});

export const forgotPasswordProfileGuard = z.object({
  password: z.string(),
});
