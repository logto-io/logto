import { type ToZodObject } from '@logto/connector-kit';
import { z } from 'zod';

export type AuthRequestInfo = {
  issuer: string;
  request: {
    id: string;
    destination?: string;
    issueInstant: string;
    assertionConsumerServiceUrl: string;
  };
};

export const authRequestInfoGuard = z.object({
  issuer: z.string(),
  request: z.object({
    id: z.string(),
    destination: z.string().optional(),
    issueInstant: z.string(),
    assertionConsumerServiceUrl: z.string(),
  }),
}) satisfies ToZodObject<AuthRequestInfo>;
