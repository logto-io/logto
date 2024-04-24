import { organizationWithOrganizationRolesGuard } from '@logto/schemas';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';

import { type ManagementApiRouter, type RouterInitArgs } from '../types.js';

export default function adminUserOrganizationRoutes<T extends ManagementApiRouter>(
  ...[router, { queries }]: RouterInitArgs<T>
) {
  router.get(
    '/users/:userId/organizations',
    koaGuard({
      params: z.object({ userId: z.string() }),
      response: organizationWithOrganizationRolesGuard.array(),
      status: [200, 404],
    }),
    async (ctx, next) => {
      const { userId } = ctx.guard.params;

      // Ensure that the user exists.
      await queries.users.findUserById(userId);

      // No pagination for now since it aligns with the current issuing of organizations
      // to ID tokens.
      ctx.body = await queries.organizations.relations.users.getOrganizationsByUserId(userId);
      return next();
    }
  );
}
