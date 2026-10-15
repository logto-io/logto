import {
  defaultTrustedDevicePolicy,
  type OrganizationWithRoles,
  type TrustedDevicePolicy,
} from '@logto/schemas';

import { UserRelationQueries } from '#src/queries/organization/user-relations.js';
import type Queries from '#src/tenants/Queries.js';

export type EffectiveTrustedDevicePolicy = Readonly<Required<TrustedDevicePolicy>>;

export const resolveEffectiveTrustedDevicePolicy = (
  policy: TrustedDevicePolicy,
  hasDisallowedOrganization: boolean
): EffectiveTrustedDevicePolicy => ({
  enabled: (policy.enabled ?? defaultTrustedDevicePolicy.enabled) && !hasDisallowedOrganization,
  durationDays: policy.durationDays ?? defaultTrustedDevicePolicy.durationDays,
});

export const createTrustedDevicePolicyLibrary = (queries: Queries) => {
  const getEffectivePolicy = async (
    userId: string,
    organizations?: Readonly<OrganizationWithRoles[]>
  ) => {
    const [signInExperience, hasDisallowedOrganization] = await Promise.all([
      queries.signInExperiences.findDefaultSignInExperience(),
      organizations
        ? organizations.some(({ isTrustedDeviceAllowed }) => !isTrustedDeviceAllowed)
        : new UserRelationQueries(queries.pool).hasUserDisallowedTrustedDeviceOrganization(userId),
    ]);

    return resolveEffectiveTrustedDevicePolicy(
      signInExperience.trustedDevice,
      hasDisallowedOrganization
    );
  };

  return {
    getEffectivePolicy,
  };
};
