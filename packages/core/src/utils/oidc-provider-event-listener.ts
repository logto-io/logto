import { GrantType, LogResult, token } from '@logto/schemas';
import type { errors, KoaContextWithOIDC, Provider } from 'oidc-provider';

import type { WithLogContext } from '#src/middleware/koa-audit-log.js';

import { stringifyError } from './format.js';
import { isEnum } from './type.js';

/**
 * OIDC provider listeners and events
 * https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#im-getting-a-client-authentication-failed-error-with-no-details
 * https://github.com/panva/node-oidc-provider/blob/v7.x/docs/events.md
 */
export const addOidcEventListeners = (provider: Provider) => {
  provider.addListener('grant.success', grantListener);
  provider.addListener('grant.error', grantListener);
  provider.addListener('grant.revoked', grantRevocationListener);
};

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

// The grant.revoked event is emitted at https://github.com/panva/node-oidc-provider/blob/564b1095ee869c89381d63dfdb5875c99f870f5f/lib/helpers/revoke.js#L25
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
 * See https://github.com/panva/node-oidc-provider/tree/main/lib/actions/grants
 * - https://github.com/panva/node-oidc-provider/blob/564b1095ee869c89381d63dfdb5875c99f870f5f/lib/actions/grants/authorization_code.js#L209
 * - https://github.com/panva/node-oidc-provider/blob/564b1095ee869c89381d63dfdb5875c99f870f5f/lib/actions/grants/refresh_token.js#L225
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
 * See [OAuth 2.0 Token Revocation](https://datatracker.ietf.org/doc/html/rfc7009) for RFC reference.
 *
 * Note the revocation may revoke related tokens as well. In oidc-provider, it will revoke the whole Grant when revoking Refresh Token.
 * So we don't assume the token type here.
 *
 * See [this function](https://github.com/panva/node-oidc-provider/blob/433d131989558e24c0c74970d2d700af2199485d/lib/actions/revocation.js#L56) for code reference.
 **/
const getRevocationTokenTypes = (oidc: KoaContextWithOIDC['oidc']): token.TokenType[] => {
  return Object.values(token.TokenType).filter((value) => oidc.entities[value]);
};
