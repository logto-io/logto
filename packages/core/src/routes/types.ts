import type Router from 'koa-router';

import type { WithAuthContext } from '@/middleware/koa-auth';
import type { WithI18nContext } from '@/middleware/koa-i18next';
import type { WithLogContext } from '@/middleware/koa-log';

export type AnonymousRouter = Router<unknown, WithLogContext & WithI18nContext>;

export type AuthedRouter = Router<unknown, WithAuthContext & WithLogContext & WithI18nContext>;
