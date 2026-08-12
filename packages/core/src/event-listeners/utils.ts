import { conditional } from '@silverhand/essentials';
import type { KoaContextWithOIDC } from 'oidc-provider';

import { type WithAppSecretContext } from '#src/middleware/koa-app-secret-transpilation.js';
import type { LogPayload } from '#src/middleware/koa-audit-log.js';
import { getClientIdentifierPayload, shouldAttributeToCimd } from '#src/oidc/cimd/index.js';

export const extractInteractionContext = (
  ctx: WithAppSecretContext<KoaContextWithOIDC>
): LogPayload => {
  const {
    entities: { Account, Session, Client, Interaction },
    params,
  } = ctx.oidc;

  const submittedClientId = params?.client_id;

  /**
   * `grant.error` fires for failures thrown before the provider resolves the Client entity — a
   * CIMD document fetch or metadata-validation failure lands exactly there — so fall back to the
   * submitted `client_id`, but only when it should be attributed to CIMD: `applicationId`
   * attribution stays resolution-backed, keeping a mistyped registered id unattributed as before.
   */
  const cimdFallbackClientId = conditional(
    typeof submittedClientId === 'string' &&
      shouldAttributeToCimd(submittedClientId) &&
      submittedClientId
  );

  return {
    ...getClientIdentifierPayload(Client?.clientId ?? cimdFallbackClientId),
    applicationSecret: ctx.appSecret,
    sessionId: Session?.jti,
    interactionId: Interaction?.jti,
    userId: Account?.accountId,
    params,
  };
};
