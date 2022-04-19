/** TODO: remove deprecated code after removing all usages (LOG-2220), and rename to koa-log */
import { LogResult, LogType, UserLogPayload, UserLogType } from '@logto/schemas';
import { Context, MiddlewareType } from 'koa';
import { nanoid } from 'nanoid';

import { insertLog } from '@/queries/log';

export type WithLogContext<ContextT> = ContextT & {
  log: LogContext;
  /** @deprecated */
  userLog: UserLogContext;
};

export interface LogContext {
  [key: string]: unknown;
  type?: LogType;
}

/** @deprecated */
export interface UserLogContext {
  type?: UserLogType;
  userId?: string;
  username?: string;
  email?: string;
  phone?: string;
  connectorId?: string;
  payload: UserLogPayload;
  createdAt: number;
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

export default function koaUserLog<StateT, ContextT, ResponseBodyT>(): MiddlewareType<
  StateT,
  WithLogContext<ContextT>,
  ResponseBodyT
> {
  return async (ctx, next) => {
    ctx.log = {};

    /** @deprecated */
    ctx.userLog = {
      createdAt: Date.now(),
      payload: {},
    };

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
