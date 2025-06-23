import { z } from 'zod';

import { type Secret } from '../db-entries/secret.js';

export type EncryptedSecret = Pick<Secret, 'encryptedDek' | 'iv' | 'authTag' | 'ciphertext'>;

export const tokenRecrodGuard = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type TokenRecord = z.infer<typeof tokenRecrodGuard>;
