import { z } from 'zod';

import { SsoConnectors, type SsoConnector } from '../db-entries/sso-connector.js';

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

export enum SsoProviderName {
  OIDC = 'OIDC',
  SAML = 'SAML',
  AZURE_AD = 'AzureAD',
  GOOGLE_WORKSPACE = 'GoogleWorkspace',
  OKTA = 'Okta',
  AZURE_AD_OIDC = 'AzureAdOidc',
}

export enum SsoProviderType {
  OIDC = 'oidc',
  SAML = 'saml',
}

export const singleSignOnDomainBlackList = Object.freeze([
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'icloud.com',
  'aol.com',
  'yandex.com',
  'mail.com',
  'protonmail.com',
  'yanex.com',
  'gmx.com',
  'mail.ru',
  'zoho.com',
  'qq.com',
  '163.com',
  '126.com',
  'sina.com',
  'sohu.com',
]);

export type SupportedSsoConnector = Omit<SsoConnector, 'providerName'> & {
  providerName: SsoProviderName;
};

const ssoConnectorProviderDetailGuard = z.object({
  providerName: z.nativeEnum(SsoProviderName),
  providerType: z.nativeEnum(SsoProviderType),
  logo: z.string(),
  logoDark: z.string(),
  description: z.string(),
  name: z.string(),
});

export type SsoConnectorProviderDetail = z.infer<typeof ssoConnectorProviderDetailGuard>;

export const ssoConnectorProvidersResponseGuard = z.array(ssoConnectorProviderDetailGuard);

export type SsoConnectorProvidersResponse = z.infer<typeof ssoConnectorProvidersResponseGuard>;

// API response guard for all the SSO connectors CRUD APIs
export const ssoConnectorWithProviderConfigGuard = SsoConnectors.guard
  // Must be a supported SSO provider name. Overwrite the providerName string type to enum.
  .extend({ providerName: z.nativeEnum(SsoProviderName) })
  .merge(
    // Static provider details
    z.object({
      name: z.string(),
      providerType: z.nativeEnum(SsoProviderType),
      providerLogo: z.string(),
      providerLogoDark: z.string(),
      // SSO connection config parsed from the provider.
      // - OIDC: connection config fetched from the OIDC provider.
      // - SAML: connection config fetched from the metadata url or metadata file.
      providerConfig: z.record(z.unknown()).optional(),
    })
  );

export type SsoConnectorWithProviderConfig = z.infer<typeof ssoConnectorWithProviderConfigGuard>;
