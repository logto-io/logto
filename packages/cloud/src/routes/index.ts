import { createRouter } from '@withtyped/server';

import { TenantsLibrary } from '#src/libraries/tenants.js';
import type { WithAuthContext } from '#src/middleware/with-auth.js';
import { Queries } from '#src/queries/index.js';

import { createTenants } from './tenants.js';

const router = createRouter<WithAuthContext, '/api'>('/api').pack(
  createTenants(new TenantsLibrary(Queries.default))
);

export default router;
