import { usernameRegEx } from '@logto/core-kit';
import { SignInIdentifier, VerificationType } from '@logto/schemas';
import { Action } from '@logto/schemas/lib/types/log/interaction.js';
import type Router from 'koa-router';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';

import { NewPasswordIdentityVerification } from '../classes/verifications/new-password-identity-verification.js';
import { experienceRoutes } from '../const.js';
import koaExperienceVerificationsAuditLog from '../middleware/koa-experience-verifications-audit-log.js';
import { type ExperienceInteractionRouterContext } from '../types.js';

export default function newPasswordIdentityVerificationRoutes<
  T extends ExperienceInteractionRouterContext,
>(router: Router<unknown, T>, { libraries, queries }: TenantContext) {
  router.post(
    `${experienceRoutes.verification}/new-password-identity`,
    koaGuard({
      body: z.object({
        identifier: z.object({
          // Only username is supported for now
          type: z.literal(SignInIdentifier.Username),
          value: z.string().regex(usernameRegEx),
        }),
        password: z.string(),
      }),
      status: [200, 400, 422],
      response: z.object({
        verificationId: z.string(),
      }),
    }),
    koaExperienceVerificationsAuditLog({
      type: VerificationType.NewPasswordIdentity,
      action: Action.Submit,
    }),
    async (ctx, next) => {
      const { identifier, password } = ctx.guard.body;
      const { experienceInteraction, verificationAuditLog } = ctx;

      verificationAuditLog.append({
        payload: {
          identifier,
          password,
        },
      });

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
