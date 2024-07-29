import { type VerificationType } from '@logto/schemas';
import { type Action } from '@logto/schemas/lib/types/log/interaction.js';
import { type MiddlewareType } from 'koa';
import { type IRouterParamContext } from 'koa-router';

import { type LogContext, type LogEntry } from '#src/middleware/koa-audit-log.js';

import { type WithExperienceInteractionContext } from './koa-experience-interaction.js';

type WithExperienceVerificationAuditLogContext<ContextT extends IRouterParamContext> = ContextT & {
  verificationAuditLog: LogEntry;
};

export default function koaExperienceVerificationsAuditLog<
  StateT,
  ContextT extends WithExperienceInteractionContext & LogContext,
  ResponseT,
>({
  type,
  action,
}: {
  type: VerificationType;
  action: Action;
}): MiddlewareType<StateT, WithExperienceVerificationAuditLogContext<ContextT>, ResponseT> {
  return async (ctx, next) => {
    const { experienceInteraction, createLog } = ctx;

    const log = createLog(
      `Interaction.${experienceInteraction.interactionEvent}.Verification.${type}.${action}`
    );

    ctx.verificationAuditLog = log;

    return next();
  };
}
