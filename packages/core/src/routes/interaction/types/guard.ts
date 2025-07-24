import { socialUserInfoGuard } from '@logto/connector-kit';
import { validateRedirectUrl } from '@logto/core-kit';
import {
  bindMfaGuard,
  eventGuard,
  verifyMfaResultGuard,
  pendingMfaGuard,
  profileGuard,
} from '@logto/schemas';
import { z } from 'zod';

// Social Authorization Uri Route Payload Guard
export const socialAuthorizationUrlPayloadGuard = z.object({
  connectorId: z.string(),
  state: z.string(),
  redirectUri: z.string().refine((url) => validateRedirectUrl(url, 'web')),
  scope: z.string().optional(),
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
  bindMfas: bindMfaGuard.array().optional(),
  // The pending mfa info, such as secret of TOTP
  pendingMfa: pendingMfaGuard.optional(),
  // The verified mfa
  verifiedMfa: verifyMfaResultGuard.optional(),
  // The user id to be used for register, if not provided, a new one will be generated
  // WebAuthn requires a user id to be provided, so we have to generate and know it before submit interaction
  pendingAccountId: z.string().optional(),
  // The marks that the user has skip binding new MFA (for new users, they don't have database records yet)
  mfaSkipped: z.boolean().optional(),
});

export const forgotPasswordProfileGuard = z.object({
  password: z.string(),
});
