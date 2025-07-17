import { type ToZodObject, GoogleConnector } from '@logto/connector-kit';
import { z } from 'zod';

export type OneTimeTokenContext = {
  // Used for organization JIT provisioning.
  jitOrganizationIds?: string[];
  // Used for Google One Tap to carry the Google Identity Sub.
  [GoogleConnector.oneTimeTokenContextKey]?: string;
};

export const oneTimeTokenContextGuard = z
  .object({
    jitOrganizationIds: z.string().array(),
    [GoogleConnector.oneTimeTokenContextKey]: z.string(),
  })
  .partial() satisfies ToZodObject<OneTimeTokenContext>;

export enum OneTimeTokenStatus {
  Active = 'active',
  Consumed = 'consumed',
  Revoked = 'revoked',
  Expired = 'expired',
}

export const oneTimeTokenStatusGuard = z.nativeEnum(OneTimeTokenStatus);
