import { adminTenantId, getManagementApiResourceIndicator } from '@logto/schemas';
import Koa from 'koa';
import Router from 'koa-router';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import type { WithAuthContext } from '#src/middleware/koa-auth/index.js';
import koaAuth from '#src/middleware/koa-auth/index.js';
import koaCors from '#src/middleware/koa-cors.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import socialRoutes from './social.js';
import userAssetsRoutes from './user-assets.js';
import userRoutes from './user.js';
import verificationCodeRoutes from './verification-code.js';

export default function initMeApis(tenant: TenantContext): Koa {
  if (tenant.id !== adminTenantId) {
    throw new Error('`/me` routes should only be initialized in the admin tenant.');
  }

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

  userRoutes(meRouter, tenant);
  socialRoutes(meRouter, tenant);
  verificationCodeRoutes(meRouter, tenant);
  userAssetsRoutes(meRouter, tenant);

  const meApp = new Koa();
  meApp.use(koaCors(EnvSet.values.cloudUrlSet));
  meApp.use(meRouter.routes()).use(meRouter.allowedMethods());

  return meApp;
}
