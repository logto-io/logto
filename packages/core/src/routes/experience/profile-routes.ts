import { InteractionEvent, updateProfileApiPayloadGuard } from '@logto/schemas';
import type Router from 'koa-router';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import { experienceRoutes } from './const.js';
import { type WithExperienceInteractionContext } from './middleware/koa-experience-interaction.js';

export default function interactionProfileRoutes<T extends WithLogContext>(
  router: Router<unknown, WithExperienceInteractionContext<T>>,
  tenant: TenantContext
) {
  router.patch(
    `${experienceRoutes.profile}`,
    koaGuard({
      body: updateProfileApiPayloadGuard,
      status: [204, 400, 403, 404, 422],
    }),
    async (ctx, next) => {
      const { experienceInteraction, guard } = ctx;

      // Guard current interaction event is not ForgotPassword
      assertThat(
        experienceInteraction.interactionEvent !== InteractionEvent.ForgotPassword,
        new RequestError({
          code: 'session.not_supported_for_forgot_password',
          statue: 400,
        })
      );

      const profilePayload = guard.body;

      await experienceInteraction.addUserProfile(profilePayload);
      await experienceInteraction.save();

      ctx.status = 204;

      return next();
    }
  );
  router.put(
    `${experienceRoutes.profile}/password`,
    koaGuard({
      body: z.object({
        password: z.string(),
      }),
      status: [204, 400, 404, 422],
    }),
    async (ctx, next) => {
      const { experienceInteraction, guard } = ctx;
      const { password } = guard.body;

      assertThat(
        experienceInteraction.interactionEvent === InteractionEvent.ForgotPassword,
        new RequestError({
          code: 'session.invalid_interaction_type',
          status: 400,
        })
      );

      await experienceInteraction.resetPassword(password);
      await experienceInteraction.save();

      ctx.status = 204;

      return next();
    }
  );
}
