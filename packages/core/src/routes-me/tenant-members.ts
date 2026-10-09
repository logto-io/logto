import {
  OrganizationScopes,
  type UserWithOrganizationRoles,
  userWithOrganizationRolesGuard,
} from '@logto/schemas';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import type { RouterInitArgs } from '#src/routes/types.js';

import { withTenantMembership } from './tenant-membership.js';
import {
  assertNotCloud,
  createTenantMemberAuthorization,
  tenantOrganizationId,
} from './tenant-organization.js';
import type { AuthedMeRouter } from './types.js';

/** A tenant member as Console lists it, the same shape the Cloud tenant member routes return. */
const tenantMemberGuard = userWithOrganizationRolesGuard.pick({
  id: true,
  avatar: true,
  username: true,
  primaryEmail: true,
  primaryPhone: true,
  name: true,
  organizationRoles: true,
});

const memberPageSize = 100;

/**
 * The members of a self-hosted deployment's tenant, managed by the members themselves.
 *
 * Every member is an admin with full Console access. Members can invite and remove other
 * members, but the last admin cannot be removed so the tenant always remains accessible.
 *
 * @see {@link tenantRoutes} for why these routes live on `/me`.
 */
export default function tenantMemberRoutes<T extends AuthedMeRouter>(
  ...[router, tenant]: RouterInitArgs<T>
) {
  const {
    queries: { organizations },
  } = tenant;
  const { assertAdmin } = createTenantMemberAuthorization(tenant);

  const listMembers = async (offset = 0): Promise<UserWithOrganizationRoles[]> => {
    const [, page] = await organizations.relations.users.getUsersByOrganizationId(
      tenantOrganizationId,
      { limit: memberPageSize, offset }
    );

    return page.length < memberPageSize
      ? [...page]
      : [...page, ...(await listMembers(offset + memberPageSize))];
  };

  /**
   * The tenant scopes of the caller, which Console uses to decide what they may do.
   *
   * Open to every Console user: one outside the tenant organization simply has none.
   */
  router.get(
    '/tenant/scopes',
    koaGuard({ response: OrganizationScopes.guard.array(), status: [200, 501] }),
    async (ctx, next) => {
      assertNotCloud();

      ctx.body = await organizations.relations.usersRoles.getUserScopes(
        tenantOrganizationId,
        ctx.auth.id
      );

      return next();
    }
  );

  router.get(
    '/tenant/members',
    koaGuard({ response: tenantMemberGuard.array(), status: [200, 403, 501] }),
    async (ctx, next) => {
      assertNotCloud();
      await assertAdmin(ctx.auth.id);

      ctx.body = await listMembers();

      return next();
    }
  );

  /**
   * Remove a member from the tenant, together with their Console access. Members may remove
   * anyone, including themselves, but not the last admin.
   */
  router.delete(
    '/tenant/members/:userId',
    koaGuard({
      params: z.object({ userId: z.string().min(1) }),
      status: [204, 403, 404, 422, 501],
    }),
    async (ctx, next) => {
      assertNotCloud();

      const { userId } = ctx.guard.params;

      await withTenantMembership(tenant, async (membership) => {
        await membership.assertAdmin(ctx.auth.id);
        await membership.assertNotLastAdmin(userId);
        // Removing the membership cascades to the member's tenant roles.
        await membership.organizations.relations.users.delete({
          organizationId: tenantOrganizationId,
          userId,
        });
        await membership.consoleAccess.revoke(userId);
      });

      ctx.status = 204;

      return next();
    }
  );
}
