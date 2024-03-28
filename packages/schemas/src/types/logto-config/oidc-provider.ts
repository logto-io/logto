/**
 * Manually implement zod guards of some node OIDC provider types.
 *
 * Please note that we defined `accessTokenPayloadGuard` and `clientCredentialsPayloadGuard` in this file, they are used to make the user-defined token
 * sample to be aligned with the real token payload given by the OIDC provider in a real use case.
 *
 * Only keep the least necessary fields in the guards to align with the raw token payload that can be used for `extraTokenClaims` method.
 */
import { z } from 'zod';

const baseTokenPayloadGuardObject = {
  jti: z.string(),
  aud: z.union([z.string(), z.string().array()]),
  scope: z.string().optional(),
  clientId: z.string().optional(),
};

export const accessTokenPayloadGuard = z
  .object({
    ...baseTokenPayloadGuardObject,
    accountId: z.string(),
    expiresWithSession: z.boolean().optional(),
    grantId: z.string(),
    gty: z.string(),
    sessionUid: z.string().optional(),
    sid: z.string().optional(),
    kind: z.literal('AccessToken'),
  })
  .strict();

export type AccessTokenPayload = z.infer<typeof accessTokenPayloadGuard>;

export const clientCredentialsPayloadGuard = z
  .object({
    ...baseTokenPayloadGuardObject,
    kind: z.literal('ClientCredentials'),
  })
  .strict();

export type ClientCredentialsPayload = z.infer<typeof clientCredentialsPayloadGuard>;
