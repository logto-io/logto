import { type Nullable } from '@silverhand/essentials';
import type { MiddlewareType } from 'koa';

import { type QuotaLibrary } from '#src/libraries/quota.js';
import { type SubscriptionQuota } from '#src/utils/subscription/types.js';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'COPY' | 'HEAD' | 'OPTIONS';

type NewUsageGuardConfig = {
  key: keyof SubscriptionQuota;
  quota: QuotaLibrary;
  /** Guard usage only for the specified method types. Guard all if not provided. */
  methods?: Method[];
};

export function newKoaQuotaGuard<StateT, ContextT, ResponseBodyT>({
  key,
  quota,
  methods,
}: NewUsageGuardConfig): MiddlewareType<StateT, ContextT, ResponseBodyT> {
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
}: NewUsageGuardConfig): MiddlewareType<StateT, ContextT, Nullable<ResponseBodyT>> {
  return async (ctx, next) => {
    await next();

    // eslint-disable-next-line no-restricted-syntax
    if (methods.includes(ctx.method.toUpperCase() as Method)) {
      await quota.reportSubscriptionUpdatesUsage(key);
    }
  };
}
