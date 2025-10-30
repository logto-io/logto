import { type Nullable } from '@silverhand/essentials';
import type { MiddlewareType } from 'koa';

import { type QuotaLibrary } from '#src/libraries/quota.js';
import { type EntityBasedUsageKey, type AllLimitKey } from '#src/queries/tenant-usage/types.js';
import { type SubscriptionUsage } from '#src/utils/subscription/types.js';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'COPY' | 'HEAD' | 'OPTIONS';

type UsageGuardConfig = {
  key: Exclude<AllLimitKey, EntityBasedUsageKey>;
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

type UsageReportConfig = {
  key: keyof SubscriptionUsage;
  quota: QuotaLibrary;
  /** Report usage only for the specified method types. Report for all if not provided. */
  methods?: Method[];
};

export function koaReportSubscriptionUpdates<StateT, ContextT, ResponseBodyT>({
  key,
  quota,
  methods = ['POST', 'PUT', 'DELETE'],
}: UsageReportConfig): MiddlewareType<StateT, ContextT, Nullable<ResponseBodyT>> {
  return async (ctx, next) => {
    await next();

    // eslint-disable-next-line no-restricted-syntax
    if (methods.includes(ctx.method.toUpperCase() as Method)) {
      void quota.reportSubscriptionUpdatesUsage(key);
    }
  };
}
