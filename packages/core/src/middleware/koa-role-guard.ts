import { UserRole } from '@logto/schemas';
import { MiddlewareType } from 'koa';

import RequestError from '@/errors/RequestError';
import assertThat from '@/utils/assert-that';

import { WithUserInfoContext } from './koa-user-info';

export default function koaRoleGuard<
  StateT,
  ContextT extends WithUserInfoContext,
  ResponseBodyT
>(): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  return async ({ userInfo }, next) => {
    assertThat(
      userInfo.roleNames?.includes(UserRole.admin),
      new RequestError({ code: 'auth.unauthorized', status: 401 })
    );

    return next();
  };
}
