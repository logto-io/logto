import { SsoConnectors, SsoConnectorIdpInitiatedAuthConfigs } from '@logto/schemas';
import { z } from 'zod';

export const ssoConnectorCreateGuard = SsoConnectors.createGuard
  .pick({
    config: true,
    domains: true,
    branding: true,
    syncProfile: true,
    enableTokenStorage: true,
  })
  // Provider name and connector name are required for creating a connector
  .merge(SsoConnectors.guard.pick({ providerName: true, connectorName: true }));

export const ssoConnectorPatchGuard = SsoConnectors.guard
  .pick({
    config: true,
    domains: true,
    branding: true,
    syncProfile: true,
    connectorName: true,
    enableTokenStorage: true,
  })
  .partial();

const autoSignInSsoConnectorIdpInitiatedAuthConfigCreateGuard =
  SsoConnectorIdpInitiatedAuthConfigs.createGuard
    .pick({
      defaultApplicationId: true,
      redirectUri: true,
      authParameters: true,
    })
    .merge(
      z.object({
        autoSendAuthorizationRequest: z.literal(true),
      })
    );

const clientRedirectSsoConnectorIdpInitiatedAuthConfigCreateGuard =
  SsoConnectorIdpInitiatedAuthConfigs.createGuard
    .pick({
      defaultApplicationId: true,
    })
    .merge(
      z.object({
        clientIdpInitiatedAuthCallbackUri: z.string(),
        autoSendAuthorizationRequest: z.literal(false),
      })
    );

export const ssoConnectorIdpInitiatedAuthConfigCreateGuard = z.discriminatedUnion(
  'autoSendAuthorizationRequest',
  [
    clientRedirectSsoConnectorIdpInitiatedAuthConfigCreateGuard,
    autoSignInSsoConnectorIdpInitiatedAuthConfigCreateGuard,
  ]
);
