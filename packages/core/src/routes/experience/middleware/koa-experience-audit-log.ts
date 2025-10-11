import { conditionalString } from '@silverhand/essentials';
import { type MiddlewareType } from 'koa';

import { type LogContext } from '#src/middleware/koa-audit-log.js';
import { type WithInteractionDetailsContext } from '#src/middleware/koa-interaction-details.js';

export default function koaExperienceAuditLog<
  StateT,
  ContextT extends WithInteractionDetailsContext & LogContext,
  ResponseT,
>(): MiddlewareType<StateT, ContextT, ResponseT> {
  return async (ctx, next) => {
    const { prependAllLogEntries, interactionDetails } = ctx;
    const applicationId = conditionalString(interactionDetails.params.client_id);

    try {
      await next();
    } finally {
      prependAllLogEntries({ applicationId });
    }
  };
}
