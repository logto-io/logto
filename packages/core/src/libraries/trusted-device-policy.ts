import {
  defaultTrustedDevicePolicy,
  type CreateSignInExperience,
  type Organization,
  type TrustedDevicePolicy,
} from '@logto/schemas';

import OrganizationQueries from '#src/queries/organization/index.js';
import {
  lockTrustedDeviceTableForCleanup,
  lockTrustedDeviceTableForCreate,
  TrustedDeviceQueries,
} from '#src/queries/trusted-device.js';
import type Queries from '#src/tenants/Queries.js';

type EffectiveTrustedDevicePolicy = Readonly<Required<TrustedDevicePolicy>>;

export const resolveEffectiveTrustedDevicePolicy = (
  policy: TrustedDevicePolicy,
  organizations: ReadonlyArray<Pick<Organization, 'isTrustedDeviceAllowed'>>
): EffectiveTrustedDevicePolicy => ({
  enabled:
    (policy.enabled ?? defaultTrustedDevicePolicy.enabled) &&
    organizations.every(({ isTrustedDeviceAllowed }) => isTrustedDeviceAllowed),
  durationDays: policy.durationDays ?? defaultTrustedDevicePolicy.durationDays,
});

type EffectivePolicyTransaction = Readonly<{
  policy: EffectiveTrustedDevicePolicy;
  trustedDevices: TrustedDeviceQueries;
}>;

export const createTrustedDevicePolicyLibrary = (queries: Queries) => {
  const updateGlobalPolicy = queries.wellKnownCache.mutate(
    async (
      trustedDevice: Readonly<Required<TrustedDevicePolicy>>,
      signInExperienceUpdate: Omit<Partial<CreateSignInExperience>, 'trustedDevice'>
    ) => {
      return queries.pool.transaction(async (connection) => {
        if (!trustedDevice.enabled) {
          await lockTrustedDeviceTableForCleanup(connection);
        }

        const updatedSignInExperience =
          await queries.signInExperiences.updateDefaultSignInExperience(
            {
              ...signInExperienceUpdate,
              trustedDevice,
            },
            connection
          );
        if (!trustedDevice.enabled) {
          await new TrustedDeviceQueries(connection).deleteAllByTenant();
        }

        return updatedSignInExperience;
      });
    },
    ['sie']
  );

  const getEffectivePolicy = async (userId: string) => {
    const [signInExperience, organizations] = await Promise.all([
      queries.signInExperiences.findDefaultSignInExperience(),
      queries.organizations.relations.users.getOrganizationsByUserId(userId),
    ]);

    return resolveEffectiveTrustedDevicePolicy(signInExperience.trustedDevice, organizations);
  };

  const runIfEnabled = async <Result>(
    userId: string,
    run: (transaction: EffectivePolicyTransaction) => Promise<Result>
  ): Promise<Result | undefined> =>
    queries.pool.transaction(async (connection) => {
      await lockTrustedDeviceTableForCreate(connection);

      const signInExperience =
        await queries.signInExperiences.findDefaultSignInExperience(connection);
      const organizations = await new OrganizationQueries(
        connection
      ).relations.users.getOrganizationsByUserId(userId);
      const policy = resolveEffectiveTrustedDevicePolicy(
        signInExperience.trustedDevice,
        organizations
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
