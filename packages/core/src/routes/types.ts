import type { ExtendableContext } from 'koa';
import type Router from 'koa-router';

import type { WithLogContext } from '#src/middleware/koa-audit-log.js';
import type { WithAuthContext } from '#src/middleware/koa-auth/index.js';
import type { WithEmailI18nContext } from '#src/middleware/koa-email-i18n.js';
import type { WithI18nContext } from '#src/middleware/koa-i18next.js';
import type { WithHookContext } from '#src/middleware/koa-management-api-hooks.js';
import type TenantContext from '#src/tenants/TenantContext.js';

import { type WithAccountCenterContext } from './account/middlewares/koa-account-center.js';

export type AnonymousRouter = Router<
  unknown,
  WithLogContext & WithI18nContext & WithEmailI18nContext
>;

export type ManagementApiRouterContext = WithAuthContext &
  WithLogContext &
  WithI18nContext &
  WithHookContext &
  ExtendableContext;

export type ManagementApiRouter = Router<unknown, ManagementApiRouterContext>;

export type UserRouter = Router<
  unknown,
  ManagementApiRouterContext & WithAccountCenterContext & WithHookContext & WithEmailI18nContext
>;

type RouterInit<T> = (router: T, tenant: TenantContext) => void;
export type RouterInitArgs<T> = Parameters<RouterInit<T>>;
