import { ConnectorType, DemoConnector } from '@logto/connector-kit';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';
import { getTenantSubscriptionPlan } from '#src/utils/subscription/index.js';
import { type FeatureQuota } from '#src/utils/subscription/types.js';

import { type CloudConnectionLibrary } from './cloud-connection.js';
import { type ConnectorLibrary } from './connector.js';

export type QuotaLibrary = ReturnType<typeof createQuotaLibrary>;

const notNumber = (): never => {
  throw new Error('Only support usage query for numberic quota');
};

export const createQuotaLibrary = (
  queries: Queries,
  cloudConnection: CloudConnectionLibrary,
  connectorLibraray: ConnectorLibrary
) => {
  const {
    applications: { countNonM2mApplications, countM2mApplications },
    resources: { findTotalNumberOfResources },
    hooks: { getTotalNumberOfHooks },
    roles: { countRoles },
    scopes: { countScopesByResourceId },
    rolesScopes: { countRolesScopesByRoleId },
  } = queries;

  const { getLogtoConnectors } = connectorLibraray;

  const tenantUsageQueries: Record<
    keyof FeatureQuota,
    (queryKey?: string) => Promise<{ count: number }>
  > = {
    applicationsLimit: countNonM2mApplications,
    hooksLimit: getTotalNumberOfHooks,
    machineToMachineLimit: countM2mApplications,
    resourcesLimit: async () => {
      const { count } = await findTotalNumberOfResources();
      // Ignore the default management API resource
      return { count: count - 1 };
    },
    rolesLimit: async () => countRoles(),
    scopesPerResourceLimit: async (queryKey) => {
      assertThat(queryKey, new TypeError('queryKey for scopesPerResourceLimit is required'));
      return countScopesByResourceId(queryKey);
    },
    scopesPerRoleLimit: async (queryKey) => {
      assertThat(queryKey, new TypeError('queryKey for scopesPerRoleLimit is required'));
      return countRolesScopesByRoleId(queryKey);
    },
    socialConnectorsLimit: async () => {
      const connectors = await getLogtoConnectors();
      const count = connectors.filter(
        ({ type, metadata: { id, isStandard } }) =>
          type === ConnectorType.Social && !isStandard && id !== DemoConnector.Social
      ).length;
      return { count };
    },
    standardConnectorsLimit: async () => {
      const connectors = await getLogtoConnectors();
      const count = connectors.filter(
        ({ metadata: { isStandard, id } }) => isStandard && id !== DemoConnector.Social
      ).length;
      return { count };
    },
    customDomainEnabled: notNumber,
    omniSignInEnabled: notNumber, // No limit for now
    builtInEmailConnectorEnabled: notNumber, // No limit for now
  };

  const getTenantUsage = async (key: keyof FeatureQuota, queryKey?: string): Promise<number> => {
    const query = tenantUsageQueries[key];
    const { count } = await query(queryKey);

    return count;
  };

  const guardKey = async (key: keyof FeatureQuota, queryKey?: string) => {
    const { isCloud, isIntegrationTest, isProduction } = EnvSet.values;

    // Cloud only feature, skip in non-cloud environments
    if (!isCloud) {
      return;
    }

    // Disable in integration tests
    if (isIntegrationTest) {
      return;
    }

    const plan = await getTenantSubscriptionPlan(cloudConnection);
    const limit = plan.quota[key];

    if (limit === null) {
      return;
    }

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
      const tenantUsage = await getTenantUsage(key, queryKey);

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
