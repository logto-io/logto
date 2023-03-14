import { createRouter } from '@withtyped/server';

import { ServicesLibrary } from '#src/libraries/services.js';
import { TenantsLibrary } from '#src/libraries/tenants.js';
import type { WithAuthContext } from '#src/middleware/with-auth.js';
import { Queries } from '#src/queries/index.js';

import { servicesRoutes } from './services.js';
import { tenantsRoutes } from './tenants.js';

const router = createRouter<WithAuthContext, '/api'>('/api')
  .pack(tenantsRoutes(new TenantsLibrary(Queries.default)))
  .pack(servicesRoutes(new ServicesLibrary(Queries.default)));

export default router;
