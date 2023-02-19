import { createRouter } from '@withtyped/server';

import type { WithAuthContext } from '#src/middleware/with-auth.js';

import { tenants } from './tenants.js';

const router = createRouter<WithAuthContext, '/api'>('/api').pack(tenants);

export default router;
