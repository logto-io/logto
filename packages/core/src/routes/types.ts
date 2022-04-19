import Router from 'koa-router';

import { WithAuthContext } from '@/middleware/koa-auth';
import { WithI18nContext } from '@/middleware/koa-i18next';
import { WithUserInfoContext } from '@/middleware/koa-user-info';
import { WithLogContext } from '@/middleware/koa-user-log';

export type AnonymousRouter = Router<unknown, WithLogContext<WithI18nContext>>;
export type AuthedRouter = Router<
  unknown,
  WithUserInfoContext<WithAuthContext<WithLogContext<WithI18nContext>>>
>;
