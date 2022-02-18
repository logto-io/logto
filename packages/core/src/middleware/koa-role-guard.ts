import { UserRole } from '@logto/schemas';
import { MiddlewareType } from 'koa';

import RequestError from '@/errors/RequestError';
import { findUserById } from '@/queries/user';
import assertThat from '@/utils/assert-that';

import { WithAuthContext } from './koa-auth';

export default function koaRoleGuard<
  StateT,
  ContextT extends WithAuthContext,
  ResponseBodyT
>(): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  return async (ctx, next) => {
    const userId = ctx.auth;
    const userInfo = await findUserById(userId).catch(() => {
      throw new RequestError({ code: 'auth.unauthorized', status: 401 });
    });

    assertThat(
      userInfo.roleNames.includes(UserRole.admin),
      new RequestError({ code: 'auth.unauthorized', status: 401 })
    );

    return next();
  };
}
