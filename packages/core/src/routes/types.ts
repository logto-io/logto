import type { ExtendableContext } from 'koa';
import type Router from 'koa-router';

import type { WithLogContext } from '#src/middleware/koa-audit-log.js';
import type { WithAuthContext } from '#src/middleware/koa-auth/index.js';
import type { WithI18nContext } from '#src/middleware/koa-i18next.js';
import { type WithHookContext } from '#src/middleware/koa-management-api-hooks.js';
import type TenantContext from '#src/tenants/TenantContext.js';

export type AnonymousRouter = Router<unknown, WithLogContext & WithI18nContext>;

type ManagementApiRouterContext = WithAuthContext &
  WithLogContext &
  WithI18nContext &
  WithHookContext &
  ExtendableContext;

export type ManagementApiRouter = Router<unknown, ManagementApiRouterContext>;

type RouterInit<T> = (router: T, tenant: TenantContext) => void;
export type RouterInitArgs<T> = Parameters<RouterInit<T>>;
