import { UserLogPayload, UserLogResult, UserLogType } from '@logto/schemas';
import { Context, MiddlewareType } from 'koa';
import { nanoid } from 'nanoid';

import { insertUserLog } from '@/queries/user-log';

export type WithUserLogContext<ContextT> = ContextT & {
  userLog: LogContext;
};

export interface LogContext {
  type?: UserLogType;
  userId?: string;
  payload: UserLogPayload;
  createdAt: number;
}

const insertLog = async (ctx: WithUserLogContext<Context>, result: UserLogResult) => {
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
  WithUserLogContext<ContextT>,
  ResponseBodyT
> {
  return async (ctx, next) => {
    ctx.userLog = {
      createdAt: Date.now(),
      payload: {},
    };

    try {
      await next();
      await insertLog(ctx, UserLogResult.Success);
      return;
    } catch (error: unknown) {
      await insertLog(ctx, UserLogResult.Failed);
      throw error;
    }
  };
}
