import { OrganizationJitEmailDomains } from '@logto/schemas';
import type Router from 'koa-router';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import { type WithHookContext } from '#src/middleware/koa-management-api-hooks.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import type OrganizationQueries from '#src/queries/organization/index.js';

export default function emailDomainRoutes(
  router: Router<unknown, WithHookContext>,
  organizations: OrganizationQueries
) {
  const params = Object.freeze({ id: z.string().min(1) });
  const pathname = '/:id/jit/email-domains';

  router.get(
    pathname,
    koaPagination(),
    koaGuard({
      params: z.object(params),
      response: OrganizationJitEmailDomains.guard.array(),
      status: [200],
    }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;
      const { limit, offset } = ctx.pagination;

      const [count, rows] = await organizations.jit.emailDomains.getEntities(id, { limit, offset });
      ctx.pagination.totalCount = count;
      ctx.body = rows;
      return next();
    }
  );

  router.post(
    pathname,
    koaGuard({
      params: z.object(params),
      body: z.object({ emailDomain: z.string().min(1) }),
      response: OrganizationJitEmailDomains.guard,
      status: [201],
    }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;
      const { emailDomain } = ctx.guard.body;

      ctx.body = await organizations.jit.emailDomains.insert(id, emailDomain);
      ctx.status = 201;
      return next();
    }
  );

  router.put(
    pathname,
    koaGuard({
      params: z.object(params),
      body: z.object({ emailDomains: z.string().array() }),
      status: [204],
    }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;
      const { emailDomains } = ctx.guard.body;

      await organizations.jit.emailDomains.replace(id, emailDomains);
      ctx.status = 204;
      return next();
    }
  );

  router.delete(
    `${pathname}/:emailDomain`,
    koaGuard({
      params: z.object({ ...params, emailDomain: z.string().min(1) }),
      status: [204, 404],
    }),
    async (ctx, next) => {
      const { id, emailDomain } = ctx.guard.params;

      await organizations.jit.emailDomains.delete(id, emailDomain);
      ctx.status = 204;
      return next();
    }
  );
}
