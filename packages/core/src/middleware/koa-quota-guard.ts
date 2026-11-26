import { type Nullable } from '@silverhand/essentials';
import type { MiddlewareType } from 'koa';
import type { IMiddleware } from 'koa-router';

import { type QuotaLibrary } from '#src/libraries/quota.js';
import { type UsageKey, type EntityBasedUsageKey } from '#src/queries/tenant-usage/types.js';
import { type SubscriptionUsage } from '#src/utils/subscription/types.js';

type UsageGuardConfig = {
  key: Exclude<UsageKey, EntityBasedUsageKey>;
  quota: QuotaLibrary;
};

export const isQuotaGuardMiddleware = <Type extends IMiddleware>(function_: Type): boolean =>
  function_.name === 'quotaGuardMiddleware';

export function koaQuotaGuard<StateT, ContextT, ResponseBodyT>({
  key,
  quota,
}: UsageGuardConfig): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  const quotaGuardMiddleware: MiddlewareType<StateT, ContextT, ResponseBodyT> = async (_, next) => {
    await quota.guardTenantUsageByKey(key);
    return next();
  };

  return quotaGuardMiddleware;
}

type UsageReportConfig = {
  key: keyof SubscriptionUsage;
  quota: QuotaLibrary;
};

export function koaReportSubscriptionUpdates<StateT, ContextT, ResponseBodyT>({
  key,
  quota,
}: UsageReportConfig): MiddlewareType<StateT, ContextT, Nullable<ResponseBodyT>> {
  return async (_, next) => {
    await next();

    void quota.reportSubscriptionUpdatesUsage(key);
  };
}
