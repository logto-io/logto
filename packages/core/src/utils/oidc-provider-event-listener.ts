import { GrantType, IssuedTokenType, LogResult } from '@logto/schemas';
import { notFalsy } from '@silverhand/essentials';
import { errors, KoaContextWithOIDC } from 'oidc-provider';

import { WithLogContext } from '@/middleware/koa-log';

/**
 * See https://github.com/panva/node-oidc-provider/tree/main/lib/actions/grants
 * - https://github.com/panva/node-oidc-provider/blob/564b1095ee869c89381d63dfdb5875c99f870f5f/lib/actions/grants/authorization_code.js#L209
 * - https://github.com/panva/node-oidc-provider/blob/564b1095ee869c89381d63dfdb5875c99f870f5f/lib/actions/grants/refresh_token.js#L225
 * - ……
 */
interface GrantBody {
  access_token?: string;
  refresh_token?: string;
  id_token?: string;
  scope?: string; // AccessToken.scope
}

const getLogType = (grantType: unknown) => {
  if (
    !grantType ||
    ![GrantType.AuthorizationCode, GrantType.RefreshToken].includes(grantType as GrantType)
  ) {
    console.error('Unexpected grant_type', grantType);

    return;
  }

  return grantType === GrantType.AuthorizationCode
    ? 'CodeExchangeToken'
    : 'RefreshTokenExchangeToken';
};

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
  const issued: IssuedTokenType[] = [
    access_token && 'accessToken',
    refresh_token && 'refreshToken',
    id_token && 'idToken',
  ].filter((value): value is IssuedTokenType => notFalsy(value));

  ctx.log(logType, {
    userId: account?.accountId,
    params,
    issued,
    scope,
  });
};

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
