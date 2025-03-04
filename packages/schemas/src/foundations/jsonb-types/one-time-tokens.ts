import { type ToZodObject } from '@logto/connector-kit';
import { z } from 'zod';

export type OneTimeTokenContext = {
  // Used for organization JIT provisioning.
  jitOrganizationIds?: string[];
};

export const oneTimeTokenContextGuard = z
  .object({
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
