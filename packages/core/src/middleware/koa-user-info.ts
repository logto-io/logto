import { UserInfo, userInfoSelectFields } from '@logto/schemas';
import { MiddlewareType } from 'koa';
import pick from 'lodash.pick';

import RequestError from '@/errors/RequestError';
import { WithAuthContext } from '@/middleware/koa-auth';
import { findUserById, hasUserWithId } from '@/queries/user';

export type WithUserInfoContext<ContextT extends WithAuthContext = WithAuthContext> = ContextT & {
  user: UserInfo;
};

export default function koaUserInfo<
  StateT,
  ContextT extends WithAuthContext,
  ResponseBodyT
>(): MiddlewareType<StateT, WithUserInfoContext<ContextT>, ResponseBodyT> {
  return async (ctx, next) => {
    try {
      const { userId } = ctx;
      const userIdExists = await hasUserWithId(userId);
      if (!userIdExists) {
        throw new RequestError({ code: 'entity.not_exists_with_id', userId, status: 404 });
      }

      const user = await findUserById(userId);
      ctx.user = pick(user, ...userInfoSelectFields);
    } catch {
      throw new RequestError({ code: 'auth.unauthorized', status: 401 });
    }

    return next();
  };
}
