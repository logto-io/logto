import { z } from 'zod';

import RequestError from '@/errors/RequestError';
import koaAuth, { verifyBearerTokenFromRequest } from '@/middleware/koa-auth';
import koaGuard from '@/middleware/koa-guard';
import assertThat from '@/utils/assert-that';

import { AnonymousRouter } from './types';

/**
 * Authn stands for authentication.
 * This router will have a route `/authn` to authenticate tokens with a general manner.
 * For now, we only implement the API for Hasura authentication.
 */
export default function authnRoutes<T extends AnonymousRouter>(router: T) {
  router.get(
    '/authn/hasura',
    koaGuard({
      query: z.object({ resource: z.string().min(1) }),
      status: [200, 401],
    }),
    async (ctx, next) => {
      const expectedRole = ctx.headers['expected-role']?.toString();
      const { sub, roleNames } = await verifyBearerTokenFromRequest(
        ctx.request,
        ctx.guard.query.resource
      );

      if (expectedRole) {
        assertThat(
          roleNames?.includes(expectedRole),
          new RequestError({ code: 'auth.expected_role_not_found', status: 401 })
        );
      }

      ctx.body = {
        'X-Hasura-User-Id': sub,
        'X-Hasura-Role': expectedRole,
      };
      ctx.status = 200;

      return next();
    }
  );
}
