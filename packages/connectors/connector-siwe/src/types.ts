import { z } from 'zod';

export const siweConfigGuard = z.object({
  statement: z.string().optional(),
  chainIds: z.string().optional(),
});

export type SiweConfig = z.infer<typeof siweConfigGuard>;

/**
 * The connector session is created by `getAuthorizationUri` and consumed by `getUserInfo`.
 * It binds the one-time nonce to the sign-in page and the message validity window.
 */
export const siweSessionGuard = z.object({
  nonce: z.string(),
  domain: z.string(),
  uri: z.string(),
  issuedAt: z.string(),
  expirationTime: z.string(),
  chainIds: z.number().int().positive().array(),
  statement: z.string(),
});

export type SiweSession = z.infer<typeof siweSessionGuard>;

export const siweCallbackDataGuard = z.object({
  message: z.string().min(1),
  signature: z.string().min(1),
});

export type SiweCallbackData = z.infer<typeof siweCallbackDataGuard>;
