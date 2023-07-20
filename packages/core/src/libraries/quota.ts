import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';
import { getTenantSubscriptionPlan } from '#src/utils/subscription/index.js';
import { type FeatureQuota } from '#src/utils/subscription/types.js';

import { type CloudConnectionLibrary } from './cloud-connection.js';

export type QuotaLibrary = ReturnType<typeof createQuotaLibrary>;

export const createQuotaLibrary = (queries: Queries, cloudConnection: CloudConnectionLibrary) => {
  const {
    applications: { countNonM2mApplications, countM2mApplications },
    resources: { findTotalNumberOfResources },
  } = queries;

  const getTenantUsage = async (key: keyof FeatureQuota): Promise<number> => {
    if (key === 'applicationsLimit') {
      return countNonM2mApplications();
    }

    if (key === 'machineToMachineLimit') {
      return countM2mApplications();
    }

    if (key === 'resourcesLimit') {
      const { count } = await findTotalNumberOfResources();
      // Ignore the default management API resource
      return count - 1;
    }

    // TODO: add other keys

    throw new Error('Unsupported subscription quota key');
  };

  const guardKey = async (key: keyof FeatureQuota) => {
    const { isCloud, isIntegrationTest, isProduction } = EnvSet.values;

    // Cloud only feature, skip in non-cloud production environments
    if (isProduction && !isCloud) {
      return;
    }

    // Disable in integration tests
    if (isIntegrationTest) {
      return;
    }

    // TODO @sijie: remove this when pricing is ready
    if (isProduction) {
      return;
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
      const tenantUsage = await getTenantUsage(key);

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
  };

  return { guardKey };
};
