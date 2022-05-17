import { GrantType, IssuedTokenType, LogResult, LogType } from '@logto/schemas';
import { notFalsy } from '@silverhand/essentials';
import { nanoid } from 'nanoid';
import { KoaContextWithOIDC } from 'oidc-provider';

import { insertLog } from '@/queries/log';

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

export const grantSuccessListener = async (ctx: KoaContextWithOIDC & { body: GrantBody }) => {
  const {
    oidc: {
      entities: { Account: account, Grant: grant, Client: client },
      params,
    },
    request: {
      ip,
      headers: { 'user-agent': userAgent },
    },
    body,
  } = ctx;

  const grantType = params?.grant_type;
  const type: LogType =
    grantType === GrantType.AuthorizationCode ? 'CodeExchangeToken' : 'RefreshTokenExchangeToken';

  const { access_token, refresh_token, id_token, scope } = body;
  const issued: IssuedTokenType[] = [
    access_token && 'accessToken',
    refresh_token && 'refreshToken',
    id_token && 'idToken',
  ].filter((value): value is IssuedTokenType => notFalsy(value));

  await insertLog({
    id: nanoid(),
    type,
    payload: {
      result: LogResult.Success,
      ip,
      userAgent,
      applicationId: client?.clientId,
      sessionId: grant?.jti,
      userId: account?.accountId,
      params,
      issued,
      scope,
    },
  });
};
