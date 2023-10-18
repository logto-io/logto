import { type z } from 'zod';

import { type ConnectorType, type BaseConnector } from './foundation.js';
import { type ConnectorMetadata, type ssoConnectorMetadataGuard } from './metadata.js';
import { type GetOidcConfig } from './oidc.js';
import { type GetAuthorizationUri, type GetUserInfo } from './social.js';

type ssoConnectorOnlyMetadata = z.infer<typeof ssoConnectorMetadataGuard>;

// Domains and restrictedSignInMethod are mandatory for SSO connectors
export type SsoConnectorMetadata = ConnectorMetadata & ssoConnectorOnlyMetadata;

export type SsoOidcConnector = BaseConnector<
  ConnectorType.SsoOidc,
  ConnectorMetadata & ssoConnectorOnlyMetadata
> & {
  /* Indicates if the connector config is valid */
  isConfigValid: boolean;
  getAuthorizationUri: GetAuthorizationUri;
  getUserInfo: GetUserInfo;
  /* Get full OIDC config from the connector provider */
  getOidcConfig: GetOidcConfig;
};
