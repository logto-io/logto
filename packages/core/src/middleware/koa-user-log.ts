import { UserLogPayload, UserLogResult, UserLogType } from '@logto/schemas';
import { MiddlewareType } from 'koa';
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

export default function koaUserLog<StateT, ContextT, ResponseBodyT>(): MiddlewareType<
  StateT,
  WithUserLogContext<ContextT>,
  ResponseBodyT
> {
  return async (ctx, next) => {
    const id = nanoid();
    ctx.userLog = {
      createdAt: Date.now(),
      payload: {},
    };

    const insertLog = async (result: UserLogResult) => {
      // Insert log if log context is set properly.
      if (ctx.userLog.userId && ctx.userLog.type) {
        try {
          await insertUserLog({
            id,
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

    try {
      await next();
      await insertLog(UserLogResult.Success);
      return;
    } catch (error: unknown) {
      await insertLog(UserLogResult.Failed);
      throw error;
    }
  };
}
