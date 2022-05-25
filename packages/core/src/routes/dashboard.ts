import { countUsers } from '@/queries/user';

import { AuthedRouter } from './types';

export default function dashboardRoutes<T extends AuthedRouter>(router: T) {
  router.get('/dashboard/users/total', async (ctx, next) => {
    const { count: totalUserCount } = await countUsers();
    ctx.body = { totalUserCount };

    return next();
  });
}
