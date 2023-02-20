import { createRouter } from '@withtyped/server';

import { tenants } from './tenants.js';

const router = createRouter('/api').pack(tenants);

export default router;
