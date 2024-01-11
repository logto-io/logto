import { OrganizationInvitations, organizationInvitationEntityGuard } from '@logto/schemas';
import Router, { type IRouterParamContext } from 'koa-router';

import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import { tableToPathname } from '#src/utils/SchemaRouter.js';

import { type AuthedRouter, type RouterInitArgs } from '../types.js';

export default function organizationInvitationRoutes<T extends AuthedRouter>(
  ...[
    originalRouter,
    {
      queries: {
        organizations: { invitations },
      },
    },
  ]: RouterInitArgs<T>
) {
  const router = new Router<unknown, IRouterParamContext>({
    prefix: '/' + tableToPathname(OrganizationInvitations.table),
  });

  router.get(
    '/',
    koaPagination(),
    koaGuard({ response: organizationInvitationEntityGuard.array(), status: [200] }),
    async (ctx, next) => {
      const { limit, offset } = ctx.pagination;
      const [count, entities] = await invitations.findAll(limit, offset);

      ctx.pagination.totalCount = count;
      ctx.body = entities;
      ctx.status = 200;
      return next();
    }
  );

  originalRouter.use(router.routes());
}
