import { PersonalAccessTokens } from '@logto/schemas';
import { generateStandardSecret } from '@logto/shared';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';

import { type ManagementApiRouter, type RouterInitArgs } from '../types.js';

export default function adminUserPersonalAccessTokenRoutes<T extends ManagementApiRouter>(
  ...[router, { queries }]: RouterInitArgs<T>
) {
  router.post(
    '/users/:userId/personal-access-tokens',
    koaGuard({
      params: z.object({ userId: z.string() }),
      body: PersonalAccessTokens.createGuard.pick({ name: true, expiresAt: true }),
      response: PersonalAccessTokens.guard,
      status: [201, 400],
    }),
    async (ctx, next) => {
      const {
        params: { userId },
        body,
      } = ctx.guard;

      assertThat(
        !body.expiresAt || body.expiresAt > Date.now(),
        new RequestError({
          code: 'request.invalid_input',
          details: 'The value of `expiresAt` must be in the future.',
        })
      );

      ctx.body = await queries.personalAccessTokens.insert({
        ...body,
        userId,
        value: `pat_${generateStandardSecret()}`,
      });
      ctx.status = 201;

      return next();
    }
  );
}
