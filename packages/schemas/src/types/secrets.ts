import { z } from 'zod';

import { type Secret, Secrets } from '../db-entries/secret.js';

export type EncryptedSecret = Pick<Secret, 'encryptedDek' | 'iv' | 'authTag' | 'ciphertext'>;

export const tokenSetGuard = z.object({
  id_token: z.string().optional(),
  access_token: z.string(),
  refresh_token: z.string().optional(),
});

export type TokenSet = z.infer<typeof tokenSetGuard>;

export const encryptedTokenSetGuard = z.object({
  encryptedTokenSet: Secrets.guard.pick({
    encryptedDek: true,
    iv: true,
    authTag: true,
    ciphertext: true,
  }),
  scope: z.string().optional(),
  expiresAt: z.number().optional(),
  tokenType: z.string().optional(),
});

export type EncryptedTokenSet = z.infer<typeof encryptedTokenSetGuard>;
