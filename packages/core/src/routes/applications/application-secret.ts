import { Applications, ApplicationSecrets, internalPrefix } from '@logto/schemas';
import { generateStandardSecret } from '@logto/shared';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';

import { type ManagementApiRouter, type RouterInitArgs } from '../types.js';

export const generateInternalSecret = () => internalPrefix + generateStandardSecret();

export default function applicationSecretRoutes<T extends ManagementApiRouter>(
  ...[router, { queries }]: RouterInitArgs<T>
) {
  // See OpenAPI description for the rationale of this endpoint.
  router.delete(
    '/applications/:id/legacy-secret',
    koaGuard({
      params: z.object({ id: z.string().min(1) }),
      response: Applications.guard,
      status: [200, 400, 404],
    }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;

      const application = await queries.applications.findApplicationById(id);

      if (!application.secret || application.secret.startsWith(internalPrefix)) {
        throw new RequestError('application.no_legacy_secret_found');
      }

      const secret = generateInternalSecret();
      ctx.body = await queries.applications.updateApplicationById(id, { secret });
      return next();
    }
  );

  router.get(
    '/applications/:id/secrets',
    koaGuard({
      params: z.object({ id: z.string() }),
      response: ApplicationSecrets.guard.array(),
      status: [200, 404],
    }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;
      // Ensure that the application exists.
      await queries.applications.findApplicationById(id);
      ctx.body = await queries.applicationSecrets.getSecretsByApplicationId(id);
      return next();
    }
  );

  router.post(
    '/applications/:id/secrets',
    koaGuard({
      params: z.object({ id: z.string() }),
      body: ApplicationSecrets.createGuard.pick({ name: true, expiresAt: true }),
      response: ApplicationSecrets.guard,
      status: [201, 400],
    }),
    async (ctx, next) => {
      const {
        params: { id: appId },
        body,
      } = ctx.guard;

      assertThat(
        !body.expiresAt || body.expiresAt > Date.now(),
        new RequestError({
          code: 'request.invalid_input',
          details: 'The value of `expiresAt` must be in the future.',
        })
      );

      ctx.body = await queries.applicationSecrets.insert({
        ...body,
        applicationId: appId,
        value: generateStandardSecret(),
      });
      ctx.status = 201;

      return next();
    }
  );

  router.delete(
    '/applications/:id/secrets/:name',
    koaGuard({
      params: z.object({ id: z.string(), name: z.string() }),
      status: [204, 404],
    }),
    async (ctx, next) => {
      const {
        params: { id: appId, name },
      } = ctx.guard;

      await queries.applicationSecrets.deleteByName(appId, name);
      ctx.status = 204;

      return next();
    }
  );

  router.patch(
    '/applications/:id/secrets/:name',
    koaGuard({
      params: z.object({ id: z.string(), name: z.string() }),
      body: ApplicationSecrets.updateGuard.pick({ name: true }).required(),
      response: ApplicationSecrets.guard,
      status: [200, 400, 404],
    }),
    async (ctx, next) => {
      const {
        params: { id: appId, name },
        body,
      } = ctx.guard;

      ctx.body = await queries.applicationSecrets.update({
        where: { applicationId: appId, name },
        set: body,
        jsonbMode: 'replace',
      });
      return next();
    }
  );
}
