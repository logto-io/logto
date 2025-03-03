import { type ToZodObject } from '@logto/connector-kit';
import { z } from 'zod';

export type OneTimeTokenContext = {
  // Declare the appIds that users can sign-up to.
  applicationIds?: string[];
  // Used for organization JIT provisioning.
  jitOrganizationIds?: string[];
};

export const oneTimeTokenContextGuard = z
  .object({
    applicationIds: z.string().array(),
    jitOrganizationIds: z.string().array(),
  })
  .partial() satisfies ToZodObject<OneTimeTokenContext>;

export enum OneTimeTokenStatus {
  Active = 'active',
  Consumed = 'consumed',
  Revoked = 'revoked',
  Expired = 'expired',
}

export const oneTimeTokenStatusGuard = z.nativeEnum(OneTimeTokenStatus);
