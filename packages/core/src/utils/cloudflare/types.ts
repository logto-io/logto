import { z } from 'zod';

export const cloudflareResponseGuard = z.object({
  success: z.boolean(),
  result: z.unknown(),
});

export const cloudflareHostnameResponseGuard = z
  .object({
    origin: z.string(),
  })
  .catchall(z.unknown());
