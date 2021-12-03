import { UserLogDBEntry } from '@logto/schemas';
import { MiddlewareType } from 'koa';
import { nanoid } from 'nanoid';

import { insertUserLog } from '@/queries/user-log';

export type WithUserLogContext<ContextT> = ContextT & {
  userLogs: Array<Pick<UserLogDBEntry, 'userId' | 'type' | 'result' | 'payload' | 'createdAt'>>;
};

export default function koaUserLog<StateT, ContextT, ResponseBodyT>(): MiddlewareType<
  StateT,
  WithUserLogContext<ContextT>,
  ResponseBodyT
> {
  return async (ctx, next) => {
    ctx.userLogs = [];

    try {
      await next();
    } finally {
      if (ctx.userLogs.length > 0) {
        await Promise.all(
          ctx.userLogs.map(async (userLog) =>
            insertUserLog({
              ...userLog,
              id: nanoid(),
            })
          )
        );
      }
    }
  };
}
