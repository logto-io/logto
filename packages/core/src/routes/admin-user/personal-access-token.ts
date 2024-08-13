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
  router.get(
    '/users/:userId/personal-access-tokens',
    koaGuard({
      params: z.object({ userId: z.string() }),
      response: PersonalAccessTokens.guard.array(),
      status: [200, 404],
    }),
    async (ctx, next) => {
      const { userId } = ctx.guard.params;
      // Ensure that the user exists.
      await queries.users.findUserById(userId);
      ctx.body = await queries.personalAccessTokens.getTokensByUserId(userId);
      return next();
    }
  );

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

  router.delete(
    '/users/:userId/personal-access-tokens/:name',
    koaGuard({
      params: z.object({ userId: z.string(), name: z.string() }),
      status: [204, 404],
    }),
    async (ctx, next) => {
      const {
        params: { userId, name },
      } = ctx.guard;

      await queries.personalAccessTokens.deleteByName(userId, name);
      ctx.status = 204;

      return next();
    }
  );

  router.patch(
    '/users/:userId/personal-access-tokens/:name',
    koaGuard({
      params: z.object({ userId: z.string(), name: z.string() }),
      body: PersonalAccessTokens.updateGuard.pick({ name: true }).required(),
      response: PersonalAccessTokens.guard,
      status: [200, 400, 404],
    }),
    async (ctx, next) => {
      const {
        params: { userId, name },
        body,
      } = ctx.guard;

      ctx.body = await queries.personalAccessTokens.updateName(userId, name, body.name);
      return next();
    }
  );
}
