import { conditionalString } from '@silverhand/essentials';
import { type MiddlewareType } from 'koa';

import { type LogContext } from '#src/middleware/koa-audit-log.js';
import { type WithInteractionDetailsContext } from '#src/middleware/koa-interaction-details.js';
import { getClientIdentifierPayload } from '#src/oidc/cimd/index.js';

export default function koaExperienceAuditLog<
  StateT,
  ContextT extends WithInteractionDetailsContext & LogContext,
  ResponseT,
>(): MiddlewareType<StateT, ContextT, ResponseT> {
  return async (ctx, next) => {
    const { prependAllLogEntries, interactionDetails } = ctx;
    const clientId = conditionalString(interactionDetails.params.client_id);

    try {
      await next();
    } finally {
      // DEV: CIMD (client ID metadata document) support
      prependAllLogEntries(getClientIdentifierPayload(clientId));
    }
  };
}
