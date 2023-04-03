import type { AccessTokenResponse, LogtoSmsConfig } from './types.js';

export const mockedConfig: LogtoSmsConfig = {
  appId: 'mfvnO3josReyBf9zhDnlr',
  appSecret: 'lXNWW4wPj0Bq6msjIl6H3',
  tokenEndpoint: 'http://localhost:3002/oidc/token',
  endpoint: 'http://localhost:3003/api',
  resource: 'https://cloud.logto.io/api',
};

export const mockedAccessTokenResponse: AccessTokenResponse = {
  access_token: 'access_token',
  scope: 'scope',
  token_type: 'token_type',
  expires_in: 3600,
};
