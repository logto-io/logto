import { findAllRoles } from '@/queries/roles';

import { AuthedRouter } from './types';

export default function roleRoutes<T extends AuthedRouter>(router: T) {
  router.get('/roles', async (ctx, next) => {
    ctx.body = await findAllRoles();

    return next();
  });
}
