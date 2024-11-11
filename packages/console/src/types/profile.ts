import { emailRegEx } from '@logto/core-kit';
import { z } from 'zod';

export const locationStateGuard = z.object({
  email: z.string().regex(emailRegEx).nullable().optional(),
  action: z.union([z.literal('changeEmail'), z.literal('changePassword'), z.literal('linkSocial')]),
  verificationRecordId: z.string().optional(),
  newVerificationRecordId: z.string().optional(),
  connectorId: z.string().optional(),
});

export type LocationState = z.infer<typeof locationStateGuard>;
