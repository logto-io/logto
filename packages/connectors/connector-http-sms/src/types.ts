import { z } from 'zod';

export const httpSmsConfigGuard = z.object({
  endpoint: z.string(),
  authorization: z.string().optional(),
});

export type HttpSmsConfig = z.infer<typeof httpSmsConfigGuard>;
