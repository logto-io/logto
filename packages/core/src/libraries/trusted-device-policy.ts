import {
  defaultTrustedDevicePolicy,
  type CreateSignInExperience,
  type TrustedDevicePolicy,
} from '@logto/schemas';

import { UserRelationQueries } from '#src/queries/organization/user-relations.js';
import {
  lockTrustedDeviceChangesForTenant,
  TrustedDeviceQueries,
} from '#src/queries/trusted-device.js';
import type Queries from '#src/tenants/Queries.js';

type EffectiveTrustedDevicePolicy = Readonly<Required<TrustedDevicePolicy>>;

export const resolveEffectiveTrustedDevicePolicy = (
  policy: TrustedDevicePolicy,
  hasDisallowedOrganization: boolean
): EffectiveTrustedDevicePolicy => ({
  enabled: (policy.enabled ?? defaultTrustedDevicePolicy.enabled) && !hasDisallowedOrganization,
  durationDays: policy.durationDays ?? defaultTrustedDevicePolicy.durationDays,
});

type EffectivePolicyTransaction = Readonly<{
  policy: EffectiveTrustedDevicePolicy;
  trustedDevices: TrustedDeviceQueries;
}>;

export const createTrustedDevicePolicyLibrary = (tenantId: string, queries: Queries) => {
  const updateGlobalPolicy = queries.wellKnownCache.mutate(
    async (
      trustedDevice: Readonly<Required<TrustedDevicePolicy>>,
      signInExperienceUpdate: Omit<Partial<CreateSignInExperience>, 'trustedDevice'>
    ) => {
      return queries.pool.transaction(async (connection) => {
        await lockTrustedDeviceChangesForTenant(connection, tenantId);

        const currentSignInExperience =
          await queries.signInExperiences.findDefaultSignInExperience(connection);
        const shouldDeleteTrustedDevices =
          currentSignInExperience.trustedDevice.enabled === true && !trustedDevice.enabled;

        const updatedSignInExperience =
          await queries.signInExperiences.updateDefaultSignInExperience(
            {
              ...signInExperienceUpdate,
              trustedDevice,
            },
            connection
          );
        if (shouldDeleteTrustedDevices) {
          await new TrustedDeviceQueries(connection).deleteAllByTenant();
        }

        return updatedSignInExperience;
      });
    },
    ['sie']
  );

  const getEffectivePolicy = async (userId: string) => {
    const [signInExperience, hasDisallowedOrganization] = await Promise.all([
      queries.signInExperiences.findDefaultSignInExperience(),
      new UserRelationQueries(queries.pool).hasUserDisallowedTrustedDeviceOrganization(userId),
    ]);

    return resolveEffectiveTrustedDevicePolicy(
      signInExperience.trustedDevice,
      hasDisallowedOrganization
    );
  };

  const runIfEnabled = async <Result>(
    userId: string,
    run: (transaction: EffectivePolicyTransaction) => Promise<Result>
  ): Promise<Result | undefined> =>
    queries.pool.transaction(async (connection) => {
      await lockTrustedDeviceChangesForTenant(connection, tenantId);

      const signInExperience =
        await queries.signInExperiences.findDefaultSignInExperience(connection);
      const hasDisallowedOrganization = await new UserRelationQueries(
        connection
      ).hasUserDisallowedTrustedDeviceOrganization(userId);
      const policy = resolveEffectiveTrustedDevicePolicy(
        signInExperience.trustedDevice,
        hasDisallowedOrganization
      );

      if (!policy.enabled) {
        return;
      }

      return run({ policy, trustedDevices: new TrustedDeviceQueries(connection) });
    });

  return {
    getEffectivePolicy,
    runIfEnabled,
    updateGlobalPolicy,
  };
};
