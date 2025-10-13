import { ProductAccessTokenType } from '@logto/schemas';
import type { IRouterParamContext } from 'koa-router';
import type { KoaContextWithOIDC, Provider } from 'oidc-provider';

import { type WithAppSecretContext } from '#src/middleware/koa-app-secret-transpilation.js';
import type { LogPayload } from '#src/middleware/koa-audit-log.js';

export const extractInteractionContext = (
  ctx: IRouterParamContext & KoaContextWithOIDC & WithAppSecretContext
): LogPayload => {
  const {
    entities: { Account, Session, Client, Interaction },
    params,
  } = ctx.oidc;

  return {
    applicationId: Client?.clientId,
    applicationSecret: ctx.appSecret,
    sessionId: Session?.jti,
    interactionId: Interaction?.jti,
    userId: Account?.accountId,
    params,
  };
};

export const getAccessTokenEventPayload = (
  token: unknown,
  provider: Provider
): Record<string, unknown> => {
  if (token instanceof provider.AccessToken) {
    return { type: ProductAccessTokenType.User, accountId: token.accountId };
  }

  if (token instanceof provider.ClientCredentials) {
    return { type: ProductAccessTokenType.ClientCredentials, clientId: token.clientId };
  }

  return { type: ProductAccessTokenType.Unknown };
};
