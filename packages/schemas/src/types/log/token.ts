/** The type of a token event. */
export enum Type {
  ExchangeTokenBy = 'ExchangeTokenBy',
  RevokeToken = 'RevokeToken',
}

/** Available grant token types extracted from [oidc-provider](https://github.com/panva/node-oidc-provider/blob/564b1095ee869c89381d63dfdb5875c99f870f5f/lib/helpers/revoke.js#L13). */
export enum TokenType {
  AccessToken = 'AccessToken',
  RefreshToken = 'RefreshToken',
  IdToken = 'IdToken',
  AuthorizationCode = 'AuthorizationCode',
  DeviceCode = 'DeviceCode',
  BackchannelAuthenticationRequest = 'BackchannelAuthenticationRequest',
}

/** The credential to request a grant. */
export enum ExchangeByType {
  Unknown = 'Unknown',
  AuthorizationCode = 'AuthorizationCode',
  RefreshToken = 'RefreshToken',
  ClientCredentials = 'ClientCredentials',
  TokenExchange = 'TokenExchange',
}

export type LogKey = `${Type.ExchangeTokenBy}.${ExchangeByType}` | `${Type.RevokeToken}`;
