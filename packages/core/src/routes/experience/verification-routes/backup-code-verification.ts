import { backupCodeVerificationVerifyPayloadGuard } from '@logto/schemas';
import type Router from 'koa-router';
import { z } from 'zod';

import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import { BackupCodeVerification } from '../classes/verifications/backup-code-verification.js';
import { experienceRoutes } from '../const.js';
import { type WithExperienceInteractionContext } from '../middleware/koa-experience-interaction.js';

export default function backupCodeVerificationRoutes<T extends WithLogContext>(
  router: Router<unknown, WithExperienceInteractionContext<T>>,
  tenantContext: TenantContext
) {
  const { libraries, queries } = tenantContext;

  router.post(
    `${experienceRoutes.verification}/backup-code/verify`,
    koaGuard({
      body: backupCodeVerificationVerifyPayloadGuard,
      response: z.object({
        verificationId: z.string(),
      }),
      status: [200, 400, 404],
    }),
    async (ctx, next) => {
      const { experienceInteraction } = ctx;
      const { code } = ctx.guard.body;

      assertThat(experienceInteraction.identifiedUserId, 'session.not_identified');

      // TODO: Check if the MFA is enabled

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
    }
  );
}
