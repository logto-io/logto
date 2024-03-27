import { type SsoProviderType, type SsoConnectorWithProviderConfig } from '@logto/schemas';
import { z } from 'zod';

/* Oidc Connectors */
export type OidcSsoConnectorWithProviderConfig = Omit<
  SsoConnectorWithProviderConfig,
  'providerType'
> & {
  providerType: SsoProviderType.OIDC;
};

/**
 * All the following guards are copied from {@link @logto/core/packages/core/src/sso/types/oidc }
 * @TODO: consider to move them to a shared package e.g. @logto/schemas
 */

export const oidcConnectorConfigGuard = z
  .object({
    clientId: z.string(),
    clientSecret: z.string(),
    issuer: z.string(),
    scope: z.string().optional(),
  })
  .partial();

export type OidcConnectorConfig = z.infer<typeof oidcConnectorConfigGuard>;

export const oidcProviderConfigGuard = z.object({
  authorizationEndpoint: z.string(),
  tokenEndpoint: z.string(),
  userinfoEndpoint: z.string(),
  jwksUri: z.string(),
  issuer: z.string(),
});

export type OidcProviderConfig = z.infer<typeof oidcProviderConfigGuard>;
