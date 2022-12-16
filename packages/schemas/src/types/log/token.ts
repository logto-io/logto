export enum Flow {
  ExchangeTokenBy = 'ExchangeTokenBy',
  RevokeToken = 'RevokeToken',
}

/**
 * Default grant type extracted from [oidc-provider](https://github.com/panva/node-oidc-provider/blob/564b1095ee869c89381d63dfdb5875c99f870f5f/lib/helpers/revoke.js#L13).
 */
export enum TokenType {
  AccessToken = 'AccessToken',
  RefreshToken = 'RefreshToken',
  IdToken = 'IdToken',
  AuthorizationCode = 'AuthorizationCode',
  DeviceCode = 'DeviceCode',
  BackchannelAuthenticationRequest = 'BackchannelAuthenticationRequest',
}

export enum ExchangeByType {
  Unknown = 'Unknown',
  AuthorizationCode = 'AuthorizationCode',
  RefreshToken = 'RefreshToken',
  ClientCredentials = 'ClientCredentials',
}

export type LogKey = `${Flow.ExchangeTokenBy}.${ExchangeByType}` | `${Flow.RevokeToken}`;
