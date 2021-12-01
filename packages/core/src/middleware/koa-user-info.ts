import { UserInfo, userInfoSelectFields } from '@logto/schemas';
import { MiddlewareType } from 'koa';
import pick from 'lodash.pick';

import RequestError from '@/errors/RequestError';
import { WithAuthContext } from '@/middleware/koa-auth';
import { findUserById } from '@/queries/user';

export type WithUserInfoContext<ContextT extends WithAuthContext = WithAuthContext> = ContextT & {
  userInfo: UserInfo;
};

export default function koaUserInfo<
  StateT,
  ContextT extends WithAuthContext,
  ResponseBodyT
>(): MiddlewareType<StateT, WithUserInfoContext<ContextT>, ResponseBodyT> {
  return async (ctx, next) => {
    try {
      const { auth: userId } = ctx;
      const userInfo = await findUserById(userId);
      ctx.userInfo = pick(userInfo, ...userInfoSelectFields);
    } catch {
      throw new RequestError({ code: 'auth.unauthorized', status: 401 });
    }

    return next();
  };
}
