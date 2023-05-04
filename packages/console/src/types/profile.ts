import { emailRegEx } from '@logto/core-kit';
import { z } from 'zod';

export const locationStateGuard = z.object({
  email: z.string().regex(emailRegEx),
  action: z.union([z.literal('changeEmail'), z.literal('changePassword')]),
});

export type LocationState = z.infer<typeof locationStateGuard>;
