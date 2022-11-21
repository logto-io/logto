import { findAllRoles } from '#src/queries/roles.js';

import type { AuthedRouter } from './types.js';

export default function roleRoutes<T extends AuthedRouter>(router: T) {
  router.get('/roles', async (ctx, next) => {
    ctx.body = await findAllRoles();

    return next();
  });
}
