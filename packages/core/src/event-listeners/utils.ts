import type { IRouterParamContext } from 'koa-router';
import type { KoaContextWithOIDC } from 'oidc-provider';

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
