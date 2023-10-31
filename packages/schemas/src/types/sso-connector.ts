import { z } from 'zod';

/**
 * SSO Connector data type that are returned to the experience client for sign-in use.
 */
export const ssoConnectorMetadataGuard = z.object({
  id: z.string(),
  connectorName: z.string(),
  logo: z.string(),
  darkLogo: z.string().optional(),
});

export type SsoConnectorMetadata = z.infer<typeof ssoConnectorMetadataGuard>;
