import type { MiddlewareType } from 'koa';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { type CloudConnectionLibrary } from '#src/libraries/cloud-connection.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';
import { getTenantSubscriptionPlan } from '#src/utils/subscription/index.js';
import { type FeatureQuota } from '#src/utils/subscription/types.js';

type UsageGuardConfig = {
  key: keyof FeatureQuota;
  cloudConnection: CloudConnectionLibrary;
  queries: Queries;
};

const getTenantUsage = async (key: keyof FeatureQuota, queries: Queries): Promise<number> => {
  if (key === 'applicationsLimit') {
    return queries.applications.countNonM2MApplications();
  }

  // TODO: add other keys

  throw new Error('Unsupported subscription quota key');
};

export default function koaQuotaGuard<StateT, ContextT, ResponseBodyT>({
  key,
  queries,
  cloudConnection,
}: UsageGuardConfig): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  return async (ctx, next) => {
    const { isCloud, isIntegrationTest, isProduction } = EnvSet.values;

    // Disable in production until pricing is ready
    if (!isCloud || isIntegrationTest || isProduction) {
      return next();
    }

    const plan = await getTenantSubscriptionPlan(cloudConnection);
    const limit = plan.quota[key];

    if (typeof limit === 'boolean') {
      assertThat(
        limit,
        new RequestError({
          code: 'subscription.limit_exceeded',
          status: 403,
          data: {
            key,
          },
        })
      );
    } else if (typeof limit === 'number') {
      const tenantUsage = await getTenantUsage(key, queries);

      assertThat(
        tenantUsage < limit,
        new RequestError({
          code: 'subscription.limit_exceeded',
          status: 403,
          data: {
            key,
            limit,
            usage: tenantUsage,
          },
        })
      );
    } else {
      throw new TypeError('Unsupported subscription quota type');
    }

    return next();
  };
}
