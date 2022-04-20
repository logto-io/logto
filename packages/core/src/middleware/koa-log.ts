import { LogResult, LogType } from '@logto/schemas';
import { Context, MiddlewareType } from 'koa';
import { nanoid } from 'nanoid';

import { insertLog } from '@/queries/log';

export type WithLogContext<ContextT> = ContextT & {
  log: LogContext;
};

export interface LogContext {
  [key: string]: unknown;
  type?: LogType;
}

const log = async (ctx: WithLogContext<Context>, result: LogResult) => {
  const { type, ...rest } = ctx.log;

  if (!type) {
    return;
  }

  try {
    await insertLog({
      id: nanoid(),
      type,
      payload: {
        ...rest,
        result,
      },
    });
  } catch (error: unknown) {
    console.error('An error occurred while inserting log');
    console.error(error);
  }
};

export default function koaLog<StateT, ContextT, ResponseBodyT>(): MiddlewareType<
  StateT,
  WithLogContext<ContextT>,
  ResponseBodyT
> {
  return async (ctx, next) => {
    ctx.log = {};

    try {
      await next();
      await log(ctx, LogResult.Success);
    } catch (error: unknown) {
      ctx.log.error = String(error);
      await log(ctx, LogResult.Error);
      throw error;
    }
  };
}
