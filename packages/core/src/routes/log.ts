import dayjs from 'dayjs';
import { object, string } from 'zod';

import koaGuard from '@/middleware/koa-guard';
import koaPagination from '@/middleware/koa-pagination';
import { countLogs, findLogs, getDnuCountsByTimeInterval } from '@/queries/log';
import assertThat from '@/utils/assert-that';
import { dateRegex } from '@/utils/regex';

import { AuthedRouter } from './types';

const millisecondsInOneDay = 86_400_000;

export default function logRoutes<T extends AuthedRouter>(router: T) {
  router.get(
    '/logs',
    koaPagination(),
    koaGuard({
      query: object({
        userId: string().optional(),
        applicationId: string().optional(),
        logType: string().optional(),
      }),
    }),
    async (ctx, next) => {
      const { limit, offset } = ctx.pagination;
      const {
        query: { userId, applicationId, logType },
      } = ctx.guard;

      const [{ count }, logs] = await Promise.all([
        countLogs({ logType, applicationId, userId }),
        findLogs(limit, offset, { logType, userId, applicationId }),
      ]);

      // Return totalCount to pagination middleware
      ctx.pagination.totalCount = count;
      ctx.body = logs;

      return next();
    }
  );

  router.get(
    '/dashboard',
    koaGuard({
      query: object({
        start: string().regex(dateRegex),
        end: string().regex(dateRegex),
      }),
    }),
    async (ctx, next) => {
      const {
        query: { start, end },
      } = ctx.guard;

      const startTime = dayjs(start).valueOf();
      const endTime = dayjs(end).valueOf();
      assertThat(startTime <= endTime, 'dashboard.wrong_date_range');

      // Convert date closed interval to time left-closed right-open interval:
      // e.g. [2022-05-01, 2022-05-02] -> [2022-05-01 00:00:00.000, 2022-05-03 00:00:00.000)
      const endTimeExclusive = endTime + millisecondsInOneDay;
      const dnuCounts = await getDnuCountsByTimeInterval(startTime, endTimeExclusive);
      ctx.body = {
        // DNU: Daily New User
        dnuCounts,
        // DAU: Daily Active User
        dauCounts: {},
      };

      return next();
    }
  );
}
