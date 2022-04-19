/**
 * TODO: remove useless code, and rename to koa-log.ts
 */
import { LogResult, LogType, UserLogPayload, UserLogResult, UserLogType } from '@logto/schemas';
import { Context, MiddlewareType } from 'koa';
import { nanoid } from 'nanoid';

import { insertLog } from '@/queries/log';
import { insertUserLog } from '@/queries/user-log';

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

/** @deprecated */
const logUser = async (ctx: WithLogContext<Context>, result: UserLogResult) => {
  // Insert log if log context is set properly.
  if (ctx.userLog.userId && ctx.userLog.type) {
    try {
      await insertUserLog({
        id: nanoid(),
        userId: ctx.userLog.userId,
        type: ctx.userLog.type,
        result,
        payload: ctx.userLog.payload,
      });
    } catch (error: unknown) {
      console.error('An error occured while inserting user log');
      console.error(error);
    }
  }
};

export default function koaUserLog<StateT, ContextT, ResponseBodyT>(): MiddlewareType<
  StateT,
  WithLogContext<ContextT>,
  ResponseBodyT
> {
  return async (ctx, next) => {
    ctx.log = {};

    ctx.userLog = {
      createdAt: Date.now(),
      payload: {},
    };

    try {
      await next();
      await log(ctx, LogResult.Success);
      await logUser(ctx, UserLogResult.Success);

      return;
    } catch (error: unknown) {
      ctx.log.error = String(error);
      await log(ctx, LogResult.Error);
      await logUser(ctx, UserLogResult.Failed);
      throw error;
    }
  };
}
