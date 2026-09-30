import {
  TenantRole,
  defaultTenantId,
  getTenantOrganizationId,
  getTenantRole,
  type LicenseQuota,
} from '@logto/schemas';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import LicenseReader from '#src/license/LicenseReader.js';
import type OrganizationQueries from '#src/queries/organization/index.js';
import assertThat from '#src/utils/assert-that.js';

/**
 * The organization in the admin tenant that represents the only tenant of a self-hosted
 * deployment. Its members are the people who can sign in to Console.
 */
export const tenantOrganizationId = getTenantOrganizationId(defaultTenantId);

/** Tenant organizations on Cloud are managed by the Cloud service, not by their members here. */
export const assertNotCloud = () => {
  assertThat(
    !EnvSet.values.isCloud,
    new RequestError({ code: 'request.feature_not_supported', status: 501 })
  );
};

/**
 * Refuse a change the installed license does not grant. A license past its grace period grants
 * nothing, the same as in `SubscriptionLibrary.getSelfHostedSubscription`.
 */
export const assertLicenseGrants = async (feature: keyof LicenseQuota) => {
  const license = await LicenseReader.shared.read(await EnvSet.sharedPool);

  assertThat(
    license && Date.parse(license.graceEndsAt) > Date.now() && license.quota[feature],
    new RequestError({ code: 'subscription.limit_exceeded', status: 403, data: { key: feature } })
  );
};

/** Authorization of the tenant organization members, by their tenant roles. */
export const createTenantMemberAuthorization = ({
  queries: { organizations },
}: {
  queries: { organizations: OrganizationQueries };
}) => {
  const isAdmin = async (userId: string) =>
    organizations.relations.usersRoles.exists({
      organizationId: tenantOrganizationId,
      organizationRoleId: getTenantRole(TenantRole.Admin).id,
      userId,
    });

  // Not `auth.forbidden`: Console signs the user out on it, while a demoted admin should only see the
  // request fail.
  const assertAdmin = async (userId: string) => {
    assertThat(
      await isAdmin(userId),
      new RequestError({ code: 'auth.expected_role_not_found', status: 403 })
    );
  };

  return { isAdmin, assertAdmin };
};
