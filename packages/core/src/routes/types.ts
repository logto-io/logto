import Router from 'koa-router';

import { WithAuthContext } from '@/middleware/koa-auth';
import { WithI18nContext } from '@/middleware/koa-i18next';
import { WithUserInfoContext } from '@/middleware/koa-user-info';

export type AnonymousRouter = Router<unknown, WithI18nContext>;
export type AuthedRouter = Router<unknown, WithUserInfoContext<WithAuthContext<WithI18nContext>>>;
