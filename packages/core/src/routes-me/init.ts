import {
  adminTenantId,
  arbitraryObjectGuard,
  getManagementApiResourceIndicator,
  PredefinedScope,
} from '@logto/schemas';
import Koa from 'koa';
import Router from 'koa-router';

import RequestError from '#src/errors/RequestError/index.js';
import type { WithAuthContext } from '#src/middleware/koa-auth.js';
import koaAuth from '#src/middleware/koa-auth.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

export default function initMeApis(tenant: TenantContext): Koa {
  if (tenant.id !== adminTenantId) {
    throw new Error('`/me` routes should only be initialized in the admin tenant.');
  }

  const { findUserById, updateUserById } = tenant.queries.users;
  const meRouter = new Router<unknown, WithAuthContext>();

  console.log('????', getManagementApiResourceIndicator(adminTenantId, 'me'));

  meRouter.use(
    koaAuth(tenant.envSet, getManagementApiResourceIndicator(adminTenantId, 'me'), [
      PredefinedScope.All,
    ]),
    async (ctx, next) => {
      assertThat(
        ctx.auth.type === 'user',
        new RequestError({ code: 'auth.forbidden', status: 403 })
      );

      return next();
    }
  );

  meRouter.get('/custom-data', async (ctx, next) => {
    const { id: userId } = ctx.auth;
    const user = await findUserById(userId);

    ctx.body = user.customData;

    return next();
  });

  meRouter.patch(
    '/custom-data',
    koaGuard({
      body: arbitraryObjectGuard,
      response: arbitraryObjectGuard,
    }),
    async (ctx, next) => {
      const { id: userId } = ctx.auth;
      const { body: customData } = ctx.guard;

      await findUserById(userId);

      const user = await updateUserById(userId, {
        customData,
      });

      ctx.body = user.customData;

      return next();
    }
  );

  const meApp = new Koa();
  meApp.use(meRouter.routes()).use(meRouter.allowedMethods());

  return meApp;
}
