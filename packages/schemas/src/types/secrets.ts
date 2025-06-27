import { z } from 'zod';

import { type Secret } from '../db-entries/secret.js';

export type EncryptedSecret = Pick<Secret, 'encryptedDek' | 'iv' | 'authTag' | 'ciphertext'>;

export const tokenSetGuard = z.object({
  id_token: z.string().optional(),
  access_token: z.string(),
  refresh_token: z.string().optional(),
});

export type TokenSet = z.infer<typeof tokenSetGuard>;
