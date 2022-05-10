import { LogResult } from '@logto/schemas';
import { MiddlewareType } from 'koa';
import { IRouterParamContext } from 'koa-router';

import { initLogger, MergeLog } from '@/utils/logger';

type SessionPayload = {
  sessionId?: string;
  applicationId?: string;
};

type AddLogContext = (sessionPayload: SessionPayload) => void;

export type WithLogContext<ContextT extends IRouterParamContext = IRouterParamContext> =
  ContextT & {
    addLogContext: AddLogContext;
    log: MergeLog;
  };

export default function koaLog<
  StateT,
  ContextT extends IRouterParamContext,
  ResponseBodyT
>(): MiddlewareType<StateT, WithLogContext<ContextT>, ResponseBodyT> {
  return async (ctx, next) => {
    const {
      ip,
      headers: { 'user-agent': userAgent },
    } = ctx.request;

    const logger = initLogger({ result: LogResult.Success, ip, userAgent });
    ctx.addLogContext = logger.set;
    ctx.log = logger.log;

    try {
      await next();
    } catch (error: unknown) {
      logger.set({ result: LogResult.Error, error: String(error) });
      throw error;
    } finally {
      await logger.save();
    }
  };
}
