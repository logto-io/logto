import { jsonObjectGuard, subjectTokenResponseGuard } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { addSeconds } from 'date-fns';
import { object, string } from 'zod';

import { subjectTokenExpiresIn, subjectTokenPrefix } from '#src/constants/index.js';
import { EnvSet } from '#src/env-set/index.js';
import koaGuard from '#src/middleware/koa-guard.js';

import { type RouterInitArgs, type ManagementApiRouter } from '../types.js';

export default function securityRoutes<T extends ManagementApiRouter>(...args: RouterInitArgs<T>) {
  const [router, { queries }] = args;
  const {
    subjectTokens: { insertSubjectToken },
  } = queries;

  if (!EnvSet.values.isDevFeaturesEnabled) {
    return;
  }

  router.post(
    '/security/subject-tokens',
    koaGuard({
      body: object({
        userId: string(),
        context: jsonObjectGuard.optional(),
      }),
      response: subjectTokenResponseGuard,
      status: [201, 404],
    }),
    async (ctx, next) => {
      const {
        auth: { id },
        guard: {
          body: { userId, context = {} },
        },
      } = ctx;

      const subjectToken = await insertSubjectToken({
        id: `${subjectTokenPrefix}${generateStandardId()}`,
        userId,
        context,
        expiresAt: addSeconds(new Date(), subjectTokenExpiresIn).valueOf(),
        creatorId: id,
      });

      ctx.status = 201;
      ctx.body = {
        subjectToken: subjectToken.id,
        expiresIn: subjectTokenExpiresIn,
      };
      return next();
    }
  );
}
