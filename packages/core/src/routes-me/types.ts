import type Router from 'koa-router';

import type { WithAuthContext } from '#src/middleware/koa-auth/index.js';

export type AuthedMeRouter = Router<unknown, WithAuthContext>;
