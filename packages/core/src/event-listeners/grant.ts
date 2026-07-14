import { GrantType, LogResult, token } from '@logto/schemas';
import type { errors, KoaContextWithOIDC } from 'oidc-provider';
import { z } from 'zod';

import { assertLogContext } from '#src/middleware/koa-audit-log.js';

import { stringifyError } from '../utils/format.js';
import { isEnum } from '../utils/type.js';

import { extractInteractionContext } from './utils.js';

/**
 * @see {@link https://github.com/panva/node-oidc-provider/blob/v7.x/lib/actions/token.js#L71 Success event emission}
 * @see {@link https://github.com/panva/node-oidc-provider/blob/v7.x/lib/shared/error_handler.js OIDC Provider error handler}
 */
export const grantListener = (ctx: KoaContextWithOIDC, error?: errors.OIDCProviderError) => {
  assertLogContext(ctx);

  const { params } = ctx.oidc;

  const log = ctx.createLog(
    `${token.Type.ExchangeTokenBy}.${getExchangeByType(params?.grant_type)}`
  );

  const parsedBody = grantBodyGuard.safeParse(ctx.body);
  const { access_token, refresh_token, id_token, scope } = parsedBody.success
    ? parsedBody.data
    : emptyGrantBody;
  const tokenTypes = [
    access_token && token.TokenType.AccessToken,
    refresh_token && token.TokenType.RefreshToken,
    id_token && token.TokenType.IdToken,
  ].filter(Boolean);

  log.append({
    ...extractInteractionContext(ctx),
    result: error && LogResult.Error,
    tokenTypes,
    scope,
    error: error && stringifyError(error),
  });
};

// The grant.revoked event is emitted at https://github.com/panva/node-oidc-provider/blob/v7.x/lib/helpers/revoke.js#L25
export const grantRevocationListener = (ctx: KoaContextWithOIDC, grantId: string) => {
  assertLogContext(ctx);

  const {
    entities: { AccessToken, RefreshToken },
  } = ctx.oidc;

  // TODO: Check if this is needed or just use `Account?.accountId`
  const userId = AccessToken?.accountId ?? RefreshToken?.accountId;
  const tokenTypes = getRevocationTokenTypes(ctx.oidc);

  const log = ctx.createLog('RevokeToken');
  log.append({ ...extractInteractionContext(ctx), userId, grantId, tokenTypes });
};

/**
 * The grant response body. Only the log-relevant fields are guarded; on the `grant.error` event
 * the body carries an error payload instead, hence the tolerant fallback.
 *
 * @see {@link https://github.com/panva/node-oidc-provider/tree/v7.x/lib/actions/grants grants source code} for predefined grant implementations and types.
 */
const grantBodyGuard = z.object({
  access_token: z.string().optional(),
  refresh_token: z.string().optional(),
  id_token: z.string().optional(),
  /** `AccessToken.scope` */
  scope: z.string().optional(),
});

const emptyGrantBody: z.infer<typeof grantBodyGuard> = {};

const grantTypeToExchangeByType: Record<GrantType, token.ExchangeByType> = {
  [GrantType.AuthorizationCode]: token.ExchangeByType.AuthorizationCode,
  [GrantType.RefreshToken]: token.ExchangeByType.RefreshToken,
  [GrantType.ClientCredentials]: token.ExchangeByType.ClientCredentials,
  [GrantType.TokenExchange]: token.ExchangeByType.TokenExchange,
  [GrantType.DeviceCode]: token.ExchangeByType.DeviceCode,
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
