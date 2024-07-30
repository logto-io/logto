import { newPasswordIdentityVerificationPayloadGuard } from '@logto/schemas';
import type Router from 'koa-router';
import { z } from 'zod';

import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';

import { NewPasswordIdentityVerification } from '../classes/verifications/new-password-identity-verification.js';
import { experienceRoutes } from '../const.js';
import { type WithExperienceInteractionContext } from '../middleware/koa-experience-interaction.js';

export default function newPasswordIdentityVerificationRoutes<T extends WithLogContext>(
  router: Router<unknown, WithExperienceInteractionContext<T>>,
  { libraries, queries }: TenantContext
) {
  router.post(
    `${experienceRoutes.verification}/new-password-identity`,
    koaGuard({
      body: newPasswordIdentityVerificationPayloadGuard,
      status: [200, 400, 422],
      response: z.object({
        verificationId: z.string(),
      }),
    }),
    async (ctx, next) => {
      const { identifier, password } = ctx.guard.body;
      const { experienceInteraction } = ctx;

      const newPasswordIdentityVerification = NewPasswordIdentityVerification.create(
        libraries,
        queries,
        identifier
      );

      await newPasswordIdentityVerification.verify(password);

      experienceInteraction.setVerificationRecord(newPasswordIdentityVerification);

      await experienceInteraction.save();

      ctx.body = { verificationId: newPasswordIdentityVerification.id };

      ctx.status = 200;

      return next();
    }
  );
}
