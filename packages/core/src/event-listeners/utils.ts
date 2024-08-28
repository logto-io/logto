import type { IRouterParamContext } from 'koa-router';
import type { KoaContextWithOIDC } from 'oidc-provider';

import type { LogPayload } from '#src/middleware/koa-audit-log.js';

export const extractInteractionContext = (
  ctx: IRouterParamContext & KoaContextWithOIDC
): LogPayload => {
  const {
    entities: { Account, Session, Client, Interaction },
    params,
  } = ctx.oidc;

  return {
    applicationId: Client?.clientId,
    sessionId: Session?.jti,
    interactionId: Interaction?.jti,
    userId: Account?.accountId,
    params,
  };
};
