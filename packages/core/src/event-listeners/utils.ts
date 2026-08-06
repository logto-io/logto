import type { KoaContextWithOIDC } from 'oidc-provider';

import { type WithAppSecretContext } from '#src/middleware/koa-app-secret-transpilation.js';
import type { LogPayload } from '#src/middleware/koa-audit-log.js';
import { getClientIdentifierPayload } from '#src/oidc/cimd/index.js';

export const extractInteractionContext = (
  ctx: WithAppSecretContext<KoaContextWithOIDC>
): LogPayload => {
  const {
    entities: { Account, Session, Client, Interaction },
    params,
  } = ctx.oidc;

  return {
    // DEV: CIMD (client ID metadata document) support
    ...getClientIdentifierPayload(Client?.clientId),
    applicationSecret: ctx.appSecret,
    sessionId: Session?.jti,
    interactionId: Interaction?.jti,
    userId: Account?.accountId,
    params,
  };
};
