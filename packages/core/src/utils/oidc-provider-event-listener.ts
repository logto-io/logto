import { GrantType, TokenType, LogResult } from '@logto/schemas';
import { notFalsy } from '@silverhand/essentials';
import type { errors, KoaContextWithOIDC, Provider } from 'oidc-provider';

import type { WithLogContext } from '#src/middleware/koa-log.js';

export const addOidcEventListeners = (provider: Provider) => {
  /**
   * OIDC provider listeners and events
   * https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#im-getting-a-client-authentication-failed-error-with-no-details
   * https://github.com/panva/node-oidc-provider/blob/v7.x/docs/events.md
   */
  provider.addListener('grant.success', grantSuccessListener);
  provider.addListener('grant.error', grantErrorListener);
  provider.addListener('grant.revoked', grantRevokedListener);
};

/**
 * See https://github.com/panva/node-oidc-provider/tree/main/lib/actions/grants
 * - https://github.com/panva/node-oidc-provider/blob/564b1095ee869c89381d63dfdb5875c99f870f5f/lib/actions/grants/authorization_code.js#L209
 * - https://github.com/panva/node-oidc-provider/blob/564b1095ee869c89381d63dfdb5875c99f870f5f/lib/actions/grants/refresh_token.js#L225
 * - ……
 */
type GrantBody = {
  access_token?: string;
  refresh_token?: string;
  id_token?: string;
  scope?: string; // AccessToken.scope
};

const getLogType = (grantType: unknown) => {
  const allowedGrantType = new Set<unknown>([GrantType.AuthorizationCode, GrantType.RefreshToken]);

  // Only log token exchange by authorization code or refresh token.
  if (!grantType || !allowedGrantType.has(grantType)) {
    return;
  }

  return grantType === GrantType.AuthorizationCode
    ? 'CodeExchangeToken'
    : 'RefreshTokenExchangeToken';
};

// The grant.success event is emitted at https://github.com/panva/node-oidc-provider/blob/564b1095ee869c89381d63dfdb5875c99f870f5f/lib/actions/token.js#L71
export const grantSuccessListener = async (
  ctx: KoaContextWithOIDC & WithLogContext & { body: GrantBody }
) => {
  const {
    oidc: {
      entities: { Account: account, Grant: grant, Client: client },
      params,
    },
    body,
  } = ctx;

  const logType = getLogType(params?.grant_type);

  if (!logType) {
    return;
  }

  ctx.addLogContext({
    applicationId: client?.clientId,
    sessionId: grant?.jti,
  });

  const { access_token, refresh_token, id_token, scope } = body;
  const issued = [
    access_token && TokenType.AccessToken,
    refresh_token && TokenType.RefreshToken,
    id_token && TokenType.IdToken,
  ].filter((value): value is TokenType => notFalsy(value));

  ctx.log(logType, {
    userId: account?.accountId,
    params,
    issued,
    scope,
  });
};

// The grant.error event is emitted at https://github.com/panva/node-oidc-provider/blob/564b1095ee869c89381d63dfdb5875c99f870f5f/lib/helpers/initialize_app.js#L153
export const grantErrorListener = async (
  ctx: KoaContextWithOIDC & WithLogContext & { body: GrantBody },
  error: errors.OIDCProviderError
) => {
  const {
    oidc: {
      entities: { Client: client },
      params,
    },
  } = ctx;

  const logType = getLogType(params?.grant_type);

  if (!logType) {
    return;
  }

  ctx.addLogContext({
    applicationId: client?.clientId,
  });
  ctx.log(logType, {
    result: LogResult.Error,
    error: String(error),
    params,
  });
};

// OAuth 2.0 Token Revocation: https://datatracker.ietf.org/doc/html/rfc7009
// The grant.revoked event is emitted at https://github.com/panva/node-oidc-provider/blob/564b1095ee869c89381d63dfdb5875c99f870f5f/lib/helpers/revoke.js#L25
export const grantRevokedListener = async (
  ctx: KoaContextWithOIDC & WithLogContext,
  grantId: string
) => {
  const {
    oidc: {
      entities: { Client: client, AccessToken: accessToken, RefreshToken: refreshToken },
      params,
    },
  } = ctx;

  if (!refreshToken && !accessToken) {
    // Only log token revocation of access token or refresh token.
    return;
  }

  ctx.addLogContext({ applicationId: client?.clientId });
  const userId = accessToken?.accountId ?? refreshToken?.accountId;
  const tokenType = accessToken ? TokenType.AccessToken : TokenType.RefreshToken;
  ctx.log('RevokeToken', { userId, params, grantId, tokenType });
};
