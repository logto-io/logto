import { GrantType, LogResult, token } from '@logto/schemas';
import type { errors, KoaContextWithOIDC, Provider } from 'oidc-provider';

import type { WithLogContext } from '#src/middleware/koa-audit-log.js';

import { stringifyError } from './format.js';
import { isEnum } from './type.js';

/**
 * @see {@link https://github.com/panva/node-oidc-provider/blob/v7.x/docs/README.md#im-getting-a-client-authentication-failed-error-with-no-details Getting auth error with no details?}
 * @see {@link https://github.com/panva/node-oidc-provider/blob/v7.x/docs/events.md OIDC Provider events}
 */
export const addOidcEventListeners = (provider: Provider) => {
  provider.addListener('grant.success', grantListener);
  provider.addListener('grant.error', grantListener);
  provider.addListener('grant.revoked', grantRevocationListener);
};

/**
 * @see {@link https://github.com/panva/node-oidc-provider/blob/v7.x/lib/actions/token.js#L71 Success event emission}
 * @see {@link https://github.com/panva/node-oidc-provider/blob/v7.x/lib/shared/error_handler.js OIDC Provider error handler}
 */
export const grantListener = async (
  ctx: KoaContextWithOIDC & WithLogContext & { body: GrantBody },
  error?: errors.OIDCProviderError
) => {
  const {
    entities: { Account: account, Grant: grant, Client: client },
    params,
  } = ctx.oidc;

  ctx.log.setKey(`${token.Flow.ExchangeTokenBy}.${getExchangeByType(params?.grant_type)}`);

  const { access_token, refresh_token, id_token, scope } = ctx.body;
  const tokenTypes = [
    access_token && token.TokenType.AccessToken,
    refresh_token && token.TokenType.RefreshToken,
    id_token && token.TokenType.IdToken,
  ].filter(Boolean);

  ctx.log({
    result: error && LogResult.Error,
    applicationId: client?.clientId,
    sessionId: grant?.jti,
    userId: account?.accountId,
    params,
    tokenTypes,
    scope,
    error: error && stringifyError(error),
  });
};

// The grant.revoked event is emitted at https://github.com/panva/node-oidc-provider/blob/v7.x/lib/helpers/revoke.js#L25
export const grantRevocationListener = async (
  ctx: KoaContextWithOIDC & WithLogContext,
  grantId: string
) => {
  const {
    entities: { Client: client, AccessToken, RefreshToken },
    params,
  } = ctx.oidc;

  const userId = AccessToken?.accountId ?? RefreshToken?.accountId;
  const tokenTypes = getRevocationTokenTypes(ctx.oidc);

  ctx.log.setKey('RevokeToken');
  ctx.log({ userId, applicationId: client?.clientId, params, grantId, tokenTypes });
};

/**
 * @see {@link https://github.com/panva/node-oidc-provider/tree/v7.x/lib/actions/grants grants source code} for predefined grant implementations and types.
 */
type GrantBody = {
  access_token?: string;
  refresh_token?: string;
  id_token?: string;
  scope?: string; // AccessToken.scope
};

const grantTypeToExchangeByType: Record<GrantType, token.ExchangeByType> = {
  [GrantType.AuthorizationCode]: token.ExchangeByType.AuthorizationCode,
  [GrantType.RefreshToken]: token.ExchangeByType.RefreshToken,
  [GrantType.ClientCredentials]: token.ExchangeByType.ClientCredentials,
};

const getExchangeByType = (grantType: unknown): token.ExchangeByType => {
  if (!isEnum(Object.values(GrantType), grantType)) {
    return token.ExchangeByType.Unknown;
  }

  return grantTypeToExchangeByType[grantType];
};

/**
 * Note the revocation may revoke related tokens as well. In oidc-provider, it will revoke the whole Grant when revoking Refresh Token.
 * So we don't assume the token type here.
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc7009 OAuth 2.0 Token Revocation} for RFC reference.
 * @see {@link https://github.com/panva/node-oidc-provider/blob/v7.x/lib/actions/revocation.js#L56 this function} for code reference.
 **/
const getRevocationTokenTypes = (oidc: KoaContextWithOIDC['oidc']): token.TokenType[] => {
  return Object.values(token.TokenType).filter((value) => oidc.entities[value]);
};
