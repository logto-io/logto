import { type Nullable } from '@silverhand/essentials';
import type { MiddlewareType } from 'koa';

import { type QuotaLibrary } from '#src/libraries/quota.js';
import { type SubscriptionUsage } from '#src/utils/subscription/types.js';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'COPY' | 'HEAD' | 'OPTIONS';

type UsageGuardConfig = {
  key: keyof SubscriptionUsage;
  quota: QuotaLibrary;
  /** Guard usage only for the specified method types. Guard all if not provided. */
  methods?: Method[];
};

export function koaQuotaGuard<StateT, ContextT, ResponseBodyT>({
  key,
  quota,
  methods,
}: UsageGuardConfig): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  return async (ctx, next) => {
    // eslint-disable-next-line no-restricted-syntax
    if (!methods || methods.includes(ctx.method.toUpperCase() as Method)) {
      await quota.guardTenantUsageByKey(key);
    }
    return next();
  };
}

export function koaReportSubscriptionUpdates<StateT, ContextT, ResponseBodyT>({
  key,
  quota,
  methods = ['POST', 'PUT', 'DELETE'],
}: UsageGuardConfig): MiddlewareType<StateT, ContextT, Nullable<ResponseBodyT>> {
  return async (ctx, next) => {
    await next();

    // eslint-disable-next-line no-restricted-syntax
    if (methods.includes(ctx.method.toUpperCase() as Method)) {
      await quota.reportSubscriptionUpdatesUsage(key);
    }
  };
}
