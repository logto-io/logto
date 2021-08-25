import { z } from 'zod';

export const oidcModelInstancePayloadGuard = z
  .object({
    userCode: z.string().optional(),
    uid: z.string().optional(),
    grantId: z.string().optional(),
  })
  .catchall(z.unknown());

export type OidcModelInstancePayload = z.infer<typeof oidcModelInstancePayloadGuard>;

export const oidcClientMetadataGuard = z.object({
  redirectUris: z.string().array(),
  postLogoutRedirectUris: z.string().array(),
});

export type OidcClientMetadata = z.infer<typeof oidcClientMetadataGuard>;
