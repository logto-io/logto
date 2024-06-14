import { OrganizationEmailDomains } from '@logto/schemas';
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
  const pathname = '/:id/email-domains';

  router.get(
    pathname,
    koaPagination(),
    koaGuard({
      params: z.object(params),
      response: OrganizationEmailDomains.guard.array(),
      status: [200],
    }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;
      const { limit, offset } = ctx.pagination;

      const [count, rows] = await organizations.emailDomains.getEntities(id, { limit, offset });
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
      response: OrganizationEmailDomains.guard,
      status: [201],
    }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;
      const { emailDomain } = ctx.guard.body;

      ctx.body = await organizations.emailDomains.insert(id, emailDomain);
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

      await organizations.emailDomains.replace(id, emailDomains);
      ctx.status = 204;
      return next();
    }
  );

  router.delete(
    `${pathname}/:emailDomain`,
    koaGuard({
      params: z.object({ ...params, emailDomain: z.string().min(1) }),
      status: [204],
    }),
    async (ctx, next) => {
      const { id, emailDomain } = ctx.guard.params;

      await organizations.emailDomains.delete(id, emailDomain);
      ctx.status = 204;
      return next();
    }
  );
}
