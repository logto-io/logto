import {
  adminTenantId,
  arbitraryObjectGuard,
  getManagementApiResourceIndicator,
} from '@logto/schemas';
import Koa from 'koa';
import Router from 'koa-router';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import type { WithAuthContext } from '#src/middleware/koa-auth/index.js';
import koaAuth from '#src/middleware/koa-auth/index.js';
import koaCors from '#src/middleware/koa-cors.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import socialRoutes from './social.js';

export default function initMeApis(tenant: TenantContext): Koa {
  if (tenant.id !== adminTenantId) {
    throw new Error('`/me` routes should only be initialized in the admin tenant.');
  }

  const { findUserById, updateUserById } = tenant.queries.users;
  const meRouter = new Router<unknown, WithAuthContext>();

  meRouter.use(
    koaAuth(tenant.envSet, getManagementApiResourceIndicator(adminTenantId, 'me')),
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

  socialRoutes(meRouter, tenant);

  const meApp = new Koa();
  meApp.use(koaCors(EnvSet.values.cloudUrlSet));
  meApp.use(meRouter.routes()).use(meRouter.allowedMethods());

  return meApp;
}
