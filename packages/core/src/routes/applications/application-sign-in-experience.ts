import {
  ApplicationSignInExperiences,
  applicationSignInExperienceCreateGuard,
} from '@logto/schemas';
import { object, string } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';

import type { ManagementApiRouter, RouterInitArgs } from '../types.js';

function applicationSignInExperienceRoutes<T extends ManagementApiRouter>(
  ...[
    router,
    {
      queries: {
        applications: { findApplicationById },
        applicationSignInExperiences: {
          safeFindSignInExperienceByApplicationId,
          insert,
          updateByApplicationId,
        },
      },
      libraries: {
        applications: { validateThirdPartyApplicationById },
      },
    },
  ]: RouterInitArgs<T>
) {
  /**
   * Customize the branding of an application.
   *
   * - Only branding and terms links customization is supported for now. e.g. per app level sign-in method customization is not supported.
   * - Only third-party applications can be customized for now.
   * - Application level sign-in experience customization is optional, if provided, it will override the default branding and terms links.
   * - We use application ID as the unique identifier of the application level sign-in experience ID.
   */
  router.put(
    '/applications/:applicationId/sign-in-experience',
    koaGuard({
      params: object({
        applicationId: string(),
      }),
      body: applicationSignInExperienceCreateGuard,
      response: ApplicationSignInExperiences.guard,
      status: [200, 201, 404, 422],
    }),
    async (ctx, next) => {
      const {
        params: { applicationId },
        body,
      } = ctx.guard;

      await validateThirdPartyApplicationById(applicationId);

      const applicationSignInExperience = await safeFindSignInExperienceByApplicationId(
        applicationId
      );

      if (applicationSignInExperience) {
        const updatedApplicationSignInExperience = await updateByApplicationId(applicationId, body);

        ctx.body = updatedApplicationSignInExperience;
        ctx.status = 200;

        return next();
      }

      const newApplicationSignInExperience = await insert({
        ...body,
        applicationId,
      });

      ctx.body = newApplicationSignInExperience;

      ctx.status = 201;

      return next();
    }
  );

  router.get(
    '/applications/:applicationId/sign-in-experience',
    koaGuard({
      params: object({
        applicationId: string(),
      }),
      response: ApplicationSignInExperiences.guard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      const {
        params: { applicationId },
      } = ctx.guard;

      await findApplicationById(applicationId);

      const applicationSignInExperience = await safeFindSignInExperienceByApplicationId(
        applicationId
      );

      if (!applicationSignInExperience) {
        throw new RequestError({
          code: 'entity.not_exists_with_id',
          name: ApplicationSignInExperiences.table,
          id: applicationId,
          status: 404,
        });
      }

      ctx.body = applicationSignInExperience;

      ctx.status = 200;

      return next();
    }
  );
}

export default applicationSignInExperienceRoutes;
