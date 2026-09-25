import {
  TenantRole,
  defaultTenantId,
  getTenantOrganizationId,
  getTenantRole,
  Users,
} from '@logto/schemas';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import LicenseReader from '#src/license/LicenseReader.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type { RouterInitArgs } from '#src/routes/types.js';
import assertThat from '#src/utils/assert-that.js';

import type { AuthedMeRouter } from './types.js';

/**
 * The organization in the admin tenant that represents the only tenant of a self-hosted
 * deployment. Its members are the people who can sign in to Console.
 */
const tenantOrganizationId = getTenantOrganizationId(defaultTenantId);

const tenantMfaGuard = z.object({
  /** Whether every member must set up MFA to sign in to Console. */
  isMfaRequired: z.boolean(),
});

/** Tenant organizations on Cloud are managed by the Cloud service, not by their members here. */
const assertNotCloud = () => {
  assertThat(
    !EnvSet.values.isCloud,
    new RequestError({ code: 'request.feature_not_supported', status: 501 })
  );
};

const userWithoutMfaGuard = Users.guard.pick({
  id: true,
  username: true,
  primaryEmail: true,
  name: true,
  avatar: true,
});

/**
 * Tenant settings for a self-hosted deployment, managed by its own members.
 *
 * OSS Console holds no Management API token for the admin tenant, so these routes live on `/me`:
 * the caller is authenticated by the `me` resource token and authorized by their role in the
 * tenant organization, like the tenant settings Logto Cloud exposes to the members of a tenant.
 *
 * Self-hosted only: on Cloud the tenant organizations are managed by the Cloud service.
 */
export default function tenantRoutes<T extends AuthedMeRouter>(
  ...[router, tenant]: RouterInitArgs<T>
) {
  const {
    queries: { organizations },
  } = tenant;

  const isAdmin = async (userId: string) =>
    organizations.relations.usersRoles.exists({
      organizationId: tenantOrganizationId,
      organizationRoleId: getTenantRole(TenantRole.Admin).id,
      userId,
    });

  const assertAdmin = async (userId: string) => {
    assertThat(await isAdmin(userId), new RequestError({ code: 'auth.forbidden', status: 403 }));
  };

  /**
   * The MFA requirement of the tenant, and where the caller stands with it.
   *
   * Open to every Console user rather than to members only: a deployment set up before tenant
   * organizations existed can have Console users outside the organization, and the requirement does
   * not apply to them. Rejecting them would sign them out of Console.
   */
  router.get(
    '/tenant/mfa',
    koaGuard({
      response: tenantMfaGuard.extend({
        /** Whether the caller has MFA configured, i.e. whether the requirement lets them in. */
        hasMfaConfigured: z.boolean(),
        /** Whether the caller is a member of the tenant, i.e. whether the requirement applies. */
        isMember: z.boolean(),
        /** Whether the caller is an admin of the tenant, i.e. whether they can change it. */
        isAdmin: z.boolean(),
      }),
      status: [200, 501],
    }),
    async (ctx, next) => {
      assertNotCloud();

      const { id: userId } = ctx.auth;
      const [status, isMember, isCallerAdmin] = await Promise.all([
        organizations.getMfaStatus(tenantOrganizationId, userId),
        organizations.relations.users.exists({ organizationId: tenantOrganizationId, userId }),
        isAdmin(userId),
      ]);

      ctx.body = { ...status, isMember, isAdmin: isCallerAdmin };

      return next();
    }
  );

  /** The members who have no MFA configured, and will be challenged once MFA is required. */
  router.get(
    '/tenant/members-without-mfa',
    koaGuard({
      response: userWithoutMfaGuard.array(),
      status: [200, 403, 501],
    }),
    async (ctx, next) => {
      assertNotCloud();
      await assertAdmin(ctx.auth.id);

      ctx.body = await organizations.relations.users.getUsersWithoutMfa(tenantOrganizationId);

      return next();
    }
  );

  /**
   * Require every member to set up MFA to sign in to Console.
   *
   * The admin tenant's sign-in experience already enforces `isMfaRequired` of its organizations
   * (`organizationRequiredMfaPolicy` is `Mandatory` there), so this only flips the flag. Signed-in
   * members keep their session and set up MFA at their next sign-in.
   */
  router.patch(
    '/tenant/mfa',
    koaGuard({
      body: tenantMfaGuard,
      response: tenantMfaGuard,
      status: [200, 403, 501],
    }),
    async (ctx, next) => {
      assertNotCloud();
      await assertAdmin(ctx.auth.id);

      const { isMfaRequired } = ctx.guard.body;

      // Turning the requirement off is always allowed, so a lapsed license never locks it on.
      if (isMfaRequired) {
        const license = await LicenseReader.shared.read(await EnvSet.sharedPool);

        assertThat(
          license?.quota.mandatoryMfa,
          new RequestError({
            code: 'subscription.limit_exceeded',
            status: 403,
            data: { key: 'mandatoryMfa' },
          })
        );
      }

      const organization = await organizations.updateById(tenantOrganizationId, {
        isMfaRequired,
      });

      ctx.body = { isMfaRequired: organization.isMfaRequired };

      return next();
    }
  );
}
