import Router from 'koa-router';

import { WithAuthContext } from '@/middleware/koa-auth';
import { WithI18nContext } from '@/middleware/koa-i18next';
import { WithLogContext } from '@/middleware/koa-log';

export type AnonymousRouter = Router<unknown, WithLogContext & WithI18nContext>;

export type AuthedRouter = Router<unknown, WithAuthContext & WithLogContext & WithI18nContext>;
