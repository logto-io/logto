import { z } from 'zod';

export const oidcModelInstancePayloadGuard = z
  .object({
    userCode: z.string().optional(),
    uid: z.string().optional(),
    grantId: z.string().optional(),
  })
  /**
   * Try to use `.passthrough()` if type has been fixed.
   * https://github.com/colinhacks/zod/issues/452
   */
  .catchall(z.unknown());

export type OidcModelInstancePayload = z.infer<typeof oidcModelInstancePayloadGuard>;

export const oidcClientMetadataGuard = z.object({
  applicationType: z.enum(['web', 'native']),
  redirectUris: z.string().array(),
  postLogoutRedirectUris: z.string().array(),
});

export type OidcClientMetadata = z.infer<typeof oidcClientMetadataGuard>;

export const userLogPayloadGuard = z.object({
  ip: z.string().optional(),
  userAgent: z.string().optional(),
  applicationId: z.string().optional(),
  applicationName: z.string().optional(),
  details: z.object({}).optional(), // NOT intend to be parsed
});

export type UserLogPayload = z.infer<typeof userLogPayloadGuard>;

export const connectorConfigGuard = z.object({});

export type ConnectorConfig = z.infer<typeof connectorConfigGuard>;
