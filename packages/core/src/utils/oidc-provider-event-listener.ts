import { GrantType, IssuedTokenType, LogType } from '@logto/schemas';
import { notFalsy } from '@silverhand/essentials';
import { KoaContextWithOIDC } from 'oidc-provider';

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
  scope?: string;
}

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

  const grantType = params?.grant_type;
  const type: LogType =
    grantType === GrantType.AuthorizationCode ? 'CodeExchangeToken' : 'RefreshTokenExchangeToken';
  ctx.log(type, {
    userId: account?.accountId,
    params,
    issued,
    scope,
  });
};
