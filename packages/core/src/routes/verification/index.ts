import { AdditionalIdentifier, SentinelActivityAction } from '@logto/schemas';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';

import { EnvSet } from '../../env-set/index.js';
import { saveVerificationRecord } from '../../libraries/verification.js';
import { withSentinel } from '../experience/classes/libraries/sentinel-guard.js';
import { PasswordVerification } from '../experience/classes/verifications/password-verification.js';
import type { UserRouter, RouterInitArgs } from '../types.js';

export default function verificationRoutes<T extends UserRouter>(
  ...[router, { provider, queries, libraries, sentinel }]: RouterInitArgs<T>
) {
  if (!EnvSet.values.isDevFeaturesEnabled) {
    return;
  }

  router.post(
    '/verifications/password',
    koaGuard({
      body: z.object({ password: z.string().min(1) }),
      response: z.object({ verificationRecordId: z.string() }),
      status: [201, 422],
    }),
    async (ctx, next) => {
      const { id: userId } = ctx.auth;
      const { password } = ctx.guard.body;

      const passwordVerification = PasswordVerification.create(libraries, queries, {
        type: AdditionalIdentifier.UserId,
        value: userId,
      });
      await withSentinel(
        {
          sentinel,
          action: SentinelActivityAction.Password,
          identifier: {
            type: AdditionalIdentifier.UserId,
            value: userId,
          },
          payload: {
            verificationId: passwordVerification.id,
          },
        },
        passwordVerification.verify(password)
      );

      await saveVerificationRecord(userId, passwordVerification, queries);

      ctx.body = { verificationRecordId: passwordVerification.id };
      ctx.status = 201;

      return next();
    }
  );
}
