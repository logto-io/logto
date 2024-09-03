import { ConnectorType, DemoConnector } from '@logto/connector-kit';
import { ReservedPlanId, RoleType } from '@logto/schemas';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';
import {
  getTenantSubscriptionPlan,
  getTenantSubscriptionQuotaAndUsage,
  getTenantSubscriptionScopeUsage,
} from '#src/utils/subscription/index.js';
import { type SubscriptionQuota, type FeatureQuota } from '#src/utils/subscription/types.js';

import { type CloudConnectionLibrary } from './cloud-connection.js';
import { type ConnectorLibrary } from './connector.js';

export type QuotaLibrary = ReturnType<typeof createQuotaLibrary>;

const notNumber = (): never => {
  throw new Error('Only support usage query for numeric quota');
};

export const createQuotaLibrary = (
  queries: Queries,
  cloudConnection: CloudConnectionLibrary,
  connectorLibrary: ConnectorLibrary
) => {
  const {
    applications: { countThirdPartyApplications, countAllApplications, countM2mApplications },
    resources: { findTotalNumberOfResources },
    hooks: { getTotalNumberOfHooks },
    roles: { countRoles },
    scopes: { countScopesByResourceId },
    rolesScopes: { countRolesScopesByRoleId },
  } = queries;

  const { getLogtoConnectors } = connectorLibrary;

  /** @deprecated */
  const tenantUsageQueries: Record<
    keyof FeatureQuota,
    (queryKey?: string) => Promise<{ count: number }>
  > = {
    applicationsLimit: countAllApplications,
    thirdPartyApplicationsLimit: countThirdPartyApplications,
    hooksLimit: getTotalNumberOfHooks,
    machineToMachineLimit: countM2mApplications,
    resourcesLimit: async () => {
      const { count } = await findTotalNumberOfResources();
      // Ignore the default management API resource
      return { count: count - 1 };
    },
    rolesLimit: async () => countRoles(undefined, { type: RoleType.User }),
    machineToMachineRolesLimit: async () =>
      countRoles(undefined, { type: RoleType.MachineToMachine }),
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
    tenantMembersLimit: notNumber, // Cloud Admin tenant feature, no limit for now
    customDomainEnabled: notNumber,
    mfaEnabled: notNumber,
    organizationsEnabled: notNumber,
    ssoEnabled: notNumber,
    omniSignInEnabled: notNumber, // No limit for now
    builtInEmailConnectorEnabled: notNumber, // No limit for now
    customJwtEnabled: notNumber, // No limit for now
    subjectTokenEnabled: notNumber, // No limit for now
    bringYourUiEnabled: notNumber,
  };

  /** @deprecated */
  const getTenantUsage = async (key: keyof FeatureQuota, queryKey?: string): Promise<number> => {
    const query = tenantUsageQueries[key];
    const { count } = await query(queryKey);

    return count;
  };

  /** @deprecated */
  const guardKey = async (key: keyof FeatureQuota, queryKey?: string) => {
    const { isCloud, isIntegrationTest } = EnvSet.values;

    // Cloud only feature, skip in non-cloud environments
    if (!isCloud) {
      return;
    }

    // Disable in integration tests
    if (isIntegrationTest) {
      return;
    }

    const { id: planId, quota } = await getTenantSubscriptionPlan(cloudConnection);
    // Only apply hard quota limit for free plan, o/w it's soft limit (use `null` to bypass quota check for soft limit cases).
    const limit = planId === ReservedPlanId.Free ? quota[key] : null;

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

  const guardTenantUsageByKey = async (key: keyof SubscriptionQuota) => {
    const { isCloud, isIntegrationTest } = EnvSet.values;

    // Cloud only feature, skip in non-cloud environments
    if (!isCloud) {
      return;
    }

    // Disable in integration tests
    if (isIntegrationTest) {
      return;
    }

    const { quota: fullQuota, usage: fullUsage } = await getTenantSubscriptionQuotaAndUsage(
      cloudConnection
    );

    // Type `SubscriptionQuota` and type `SubscriptionUsage` are sharing keys, this design helps us to compare the usage with the quota limit in a easier way.
    const { [key]: limit } = fullQuota;
    const { [key]: usage } = fullUsage;

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
      return;
    }

    if (typeof limit === 'number') {
      // See the definition of `SubscriptionQuota` and `SubscriptionUsage` in `types.ts`, this should never happen.
      assertThat(
        typeof usage === 'number',
        new TypeError('Usage must be with the same type as the limit.')
      );

      assertThat(
        usage < limit,
        new RequestError({
          code: 'subscription.limit_exceeded',
          status: 403,
          data: {
            key,
            limit,
            usage,
          },
        })
      );

      return;
    }

    throw new TypeError('Unsupported subscription quota type');
  };

  const guardEntityScopesUsage = async (entityName: 'resources' | 'roles', entityId: string) => {
    const { isCloud, isIntegrationTest } = EnvSet.values;

    // Cloud only feature, skip in non-cloud environments
    if (!isCloud) {
      return;
    }

    // Disable in integration tests
    if (isIntegrationTest) {
      return;
    }

    const [
      {
        quota: { scopesPerResourceLimit, scopesPerRoleLimit },
      },
      scopeUsages,
    ] = await Promise.all([
      getTenantSubscriptionQuotaAndUsage(cloudConnection),
      getTenantSubscriptionScopeUsage(cloudConnection, entityName),
    ]);
    const usage = scopeUsages[entityId] ?? 0;

    if (entityName === 'resources') {
      assertThat(
        scopesPerResourceLimit === null || scopesPerResourceLimit > usage,
        new RequestError({
          code: 'subscription.limit_exceeded',
          status: 403,
          data: {
            key: 'scopesPerResourceLimit',
            limit: scopesPerResourceLimit,
            usage,
          },
        })
      );
      return;
    }

    assertThat(
      scopesPerRoleLimit === null || scopesPerRoleLimit > usage,
      new RequestError({
        code: 'subscription.limit_exceeded',
        status: 403,
        data: {
          key: 'scopesPerRoleLimit',
          limit: scopesPerRoleLimit,
          usage,
        },
      })
    );
  };

  return { guardKey, guardTenantUsageByKey, guardEntityScopesUsage };
};
