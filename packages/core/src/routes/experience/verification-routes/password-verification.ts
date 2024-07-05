import { passwordVerificationPayloadGuard } from '@logto/schemas';
import type Router from 'koa-router';
import { z } from 'zod';

import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';

import { PasswordVerification } from '../classes/verifications/password-verification.js';
import { experienceRoutes } from '../const.js';
import { type WithExperienceInteractionContext } from '../middleware/koa-experience-interaction.js';

export default function passwordVerificationRoutes<T extends WithLogContext>(
  router: Router<unknown, WithExperienceInteractionContext<T>>,
  { libraries, queries }: TenantContext
) {
  router.post(
    `${experienceRoutes.verification}/password`,
    koaGuard({
      body: passwordVerificationPayloadGuard,
      status: [200, 400, 422],
      response: z.object({
        verificationId: z.string(),
      }),
    }),
    async (ctx, next) => {
      const { identifier, password } = ctx.guard.body;

      const passwordVerification = PasswordVerification.create(libraries, queries, identifier);
      await passwordVerification.verify(password);
      ctx.experienceInteraction.setVerificationRecord(passwordVerification);
      await ctx.experienceInteraction.save();

      ctx.body = { verificationId: passwordVerification.id };

      ctx.status = 200;

      return next();
    }
  );
}
