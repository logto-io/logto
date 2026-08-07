import { conditional } from '@silverhand/essentials';
import type { KoaContextWithOIDC } from 'oidc-provider';

import { EnvSet } from '#src/env-set/index.js';
import { type WithAppSecretContext } from '#src/middleware/koa-app-secret-transpilation.js';
import type { LogPayload } from '#src/middleware/koa-audit-log.js';
import { isCimdClientId } from '#src/oidc/cimd/client-id.js';
import { getClientIdentifierPayload } from '#src/oidc/cimd/index.js';

export const extractInteractionContext = (
  ctx: WithAppSecretContext<KoaContextWithOIDC>
): LogPayload => {
  const {
    entities: { Account, Session, Client, Interaction },
    params,
  } = ctx.oidc;

  const submittedClientId = params?.client_id;

  // DEV: CIMD (client ID metadata document) support
  /**
   * `grant.error` fires for failures thrown before the provider resolves the Client entity — a
   * CIMD document fetch or metadata-validation failure lands exactly there — so fall back to the
   * submitted `client_id`, but only within the CIMD namespace: `applicationId` attribution stays
   * resolution-backed, keeping a mistyped registered id unattributed as before.
   */
  const cimdFallbackClientId = conditional(
    EnvSet.values.isDevFeaturesEnabled &&
      typeof submittedClientId === 'string' &&
      isCimdClientId(submittedClientId) &&
      submittedClientId
  );

  return {
    // DEV: CIMD (client ID metadata document) support
    ...getClientIdentifierPayload(Client?.clientId ?? cimdFallbackClientId),
    applicationSecret: ctx.appSecret,
    sessionId: Session?.jti,
    interactionId: Interaction?.jti,
    userId: Account?.accountId,
    params,
  };
};
