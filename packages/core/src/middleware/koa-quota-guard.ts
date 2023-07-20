import type { MiddlewareType } from 'koa';

import { type QuotaLibrary } from '#src/libraries/quota.js';
import { type FeatureQuota } from '#src/utils/subscription/types.js';

type UsageGuardConfig = {
  key: keyof FeatureQuota;
  quota: QuotaLibrary;
};

export default function koaQuotaGuard<StateT, ContextT, ResponseBodyT>({
  key,
  quota,
}: UsageGuardConfig): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  return async (ctx, next) => {
    await quota.guardKey(key);
    return next();
  };
}
