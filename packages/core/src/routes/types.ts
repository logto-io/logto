import type Router from 'koa-router';

import type { WithAuthContext } from '#src/middleware/koa-auth.js';
import type { WithI18nContext } from '#src/middleware/koa-i18next.js';
import type { WithLogContext } from '#src/middleware/koa-log.js';

export type AnonymousRouter = Router<unknown, WithLogContext & WithI18nContext>;

export type AuthedRouter = Router<unknown, WithAuthContext & WithLogContext & WithI18nContext>;
