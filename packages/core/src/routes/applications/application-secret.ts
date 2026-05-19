import { Applications, ApplicationSecrets, ApplicationType, internalPrefix } from '@logto/schemas';
import { generateStandardSecret } from '@logto/shared';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';

import { type ManagementApiRouter, type RouterInitArgs } from '../types.js';

export const generateInternalSecret = () => internalPrefix + generateStandardSecret();

export default function applicationSecretRoutes<T extends ManagementApiRouter>(
  ...[
    router,
    {
      queries,
      libraries: { protectedApps },
    },
  ]: RouterInitArgs<T>
) {
  const syncProtectedAppConfigsToRemote = async (appId: string) => {
    await protectedApps.syncAppConfigsToRemote(appId);
  };

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
      status: [201, 400, 500],
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

      const application = await queries.applications.findApplicationById(appId);
      const createdSecret = await queries.applicationSecrets.insert({
        ...body,
        applicationId: appId,
        value: generateStandardSecret(),
      });
      ctx.body = createdSecret;

      try {
        if (application.type === ApplicationType.Protected) {
          await syncProtectedAppConfigsToRemote(appId);
        }
      } catch {
        await queries.applicationSecrets.deleteByName(appId, createdSecret.name);
        throw new RequestError({
          code: 'application.sync_application_secret_failed',
          status: 500,
        });
      }

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

      const application = await queries.applications.findApplicationById(appId);
      const deletedSecret = await queries.applicationSecrets.deleteByName(appId, name);

      try {
        if (application.type === ApplicationType.Protected) {
          await syncProtectedAppConfigsToRemote(appId);
        }
      } catch (error: unknown) {
        await queries.applicationSecrets.insert({
          applicationId: appId,
          name: deletedSecret.name,
          value: deletedSecret.value,
          expiresAt: deletedSecret.expiresAt,
        });
        throw error;
      }

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

      const application = await queries.applications.findApplicationById(appId);
      const updatedSecret = await queries.applicationSecrets.update({
        where: { applicationId: appId, name },
        set: body,
        jsonbMode: 'replace',
      });
      ctx.body = updatedSecret;

      try {
        if (application.type === ApplicationType.Protected) {
          await syncProtectedAppConfigsToRemote(appId);
        }
      } catch (error: unknown) {
        await queries.applicationSecrets.update({
          where: { applicationId: appId, name: updatedSecret.name },
          set: { name },
          jsonbMode: 'replace',
        });
        throw error;
      }

      return next();
    }
  );
}
