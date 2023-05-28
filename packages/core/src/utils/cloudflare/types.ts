import { z } from 'zod';

export const cloudflareResponseGuard = z.object({
  success: z.boolean(),
  result: z.unknown(),
});
