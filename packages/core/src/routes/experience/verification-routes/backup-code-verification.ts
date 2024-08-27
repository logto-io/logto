import { backupCodeVerificationVerifyPayloadGuard, VerificationType } from '@logto/schemas';
import { Action } from '@logto/schemas/lib/types/log/interaction.js';
import type Router from 'koa-router';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import { BackupCodeVerification } from '../classes/verifications/backup-code-verification.js';
import { experienceRoutes } from '../const.js';
import koaExperienceVerificationsAuditLog from '../middleware/koa-experience-verifications-audit-log.js';
import { type ExperienceInteractionRouterContext } from '../types.js';

export default function backupCodeVerificationRoutes<T extends ExperienceInteractionRouterContext>(
  router: Router<unknown, T>,
  tenantContext: TenantContext
) {
  const { libraries, queries } = tenantContext;

  router.post(
    `${experienceRoutes.verification}/backup-code/generate`,
    koaGuard({
      status: [200, 400],
      response: z.object({
        verificationId: z.string(),
        codes: z.array(z.string()),
      }),
    }),
    koaExperienceVerificationsAuditLog({
      type: VerificationType.BackupCode,
      action: Action.Create,
    }),
    async (ctx, next) => {
      const { experienceInteraction } = ctx;

      assertThat(experienceInteraction.identifiedUserId, 'session.identifier_not_found');

      const backupCodeVerificationRecord = BackupCodeVerification.create(
        libraries,
        queries,
        experienceInteraction.identifiedUserId
      );

      const codes = backupCodeVerificationRecord.generate();

      ctx.experienceInteraction.setVerificationRecord(backupCodeVerificationRecord);

      await ctx.experienceInteraction.save();

      ctx.body = {
        verificationId: backupCodeVerificationRecord.id,
        codes,
      };

      return next();
    }
  );

  router.post(
    `${experienceRoutes.verification}/backup-code/verify`,
    koaGuard({
      body: backupCodeVerificationVerifyPayloadGuard,
      response: z.object({
        verificationId: z.string(),
      }),
      status: [200, 400, 404],
    }),
    koaExperienceVerificationsAuditLog({
      type: VerificationType.BackupCode,
      action: Action.Submit,
    }),
    async (ctx, next) => {
      const { experienceInteraction, verificationAuditLog } = ctx;
      const { code } = ctx.guard.body;

      verificationAuditLog.append({
        payload: {
          code,
        },
      });

      assertThat(experienceInteraction.identifiedUserId, 'session.identifier_not_found');

      const backupCodeVerificationRecord = BackupCodeVerification.create(
        libraries,
        queries,
        experienceInteraction.identifiedUserId
      );

      await backupCodeVerificationRecord.verify(code);

      ctx.experienceInteraction.setVerificationRecord(backupCodeVerificationRecord);

      await ctx.experienceInteraction.save();

      ctx.body = {
        verificationId: backupCodeVerificationRecord.id,
      };

      return next();
    }
  );
}
