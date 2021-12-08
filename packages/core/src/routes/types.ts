import Router from 'koa-router';

import { WithAuthContext } from '@/middleware/koa-auth';
import { WithI18nContext } from '@/middleware/koa-i18next';
import { WithUserInfoContext } from '@/middleware/koa-user-info';
import { WithUserLogContext } from '@/middleware/koa-user-log';

export type AnonymousRouter = Router<unknown, WithUserLogContext<WithI18nContext>>;
export type AuthedRouter = Router<
  unknown,
  WithUserInfoContext<WithAuthContext<WithUserLogContext<WithI18nContext>>>
>;
