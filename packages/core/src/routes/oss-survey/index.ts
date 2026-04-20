import { ossSurveyReportPayloadGuard } from '@logto/schemas';

import koaGuard from '#src/middleware/koa-guard.js';

import { reportOssSurvey } from '../../libraries/oss-survey.js';
import type { ManagementApiRouter, RouterInitArgs } from '../types.js';

export default function ossSurveyRoutes<T extends ManagementApiRouter>(
  ...[router]: RouterInitArgs<T>
) {
  router.post(
    '/oss-survey/report',
    koaGuard({
      body: ossSurveyReportPayloadGuard,
      status: 204,
    }),
    async (ctx, next) => {
      reportOssSurvey(ctx.guard.body);
      ctx.status = 204;

      return next();
    }
  );
}
