import { passwordVerificationPayloadGuard, VerificationType } from '@logto/schemas';
import { Action } from '@logto/schemas/lib/types/log/interaction.js';
import type Router from 'koa-router';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';

import { PasswordVerification } from '../classes/verifications/password-verification.js';
import { experienceRoutes } from '../const.js';
import koaExperienceVerificationsAuditLog from '../middleware/koa-experience-verifications-audit-log.js';
import { type ExperienceInteractionRouterContext } from '../types.js';

export default function passwordVerificationRoutes<T extends ExperienceInteractionRouterContext>(
  router: Router<unknown, T>,
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
    koaExperienceVerificationsAuditLog({
      type: VerificationType.Password,
      action: Action.Submit,
    }),
    async (ctx, next) => {
      const { identifier, password } = ctx.guard.body;

      ctx.verificationAuditLog.append({
        payload: {
          identifier,
          password,
        },
      });

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
