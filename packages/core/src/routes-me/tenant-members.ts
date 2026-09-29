import {
  OrganizationScopes,
  TenantRole,
  getTenantRole,
  type UserWithOrganizationRoles,
  userWithOrganizationRolesGuard,
} from '@logto/schemas';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type { RouterInitArgs } from '#src/routes/types.js';
import assertThat from '#src/utils/assert-that.js';

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
 * Mirrors the tenant member routes of Logto Cloud, so Console can manage the members of either
 * with the same pages. Every member may list the members; only admins may change them, and the
 * last admin can be neither removed nor demoted, so the tenant always keeps someone who can.
 *
 * @see {@link tenantRoutes} for why these routes live on `/me`.
 */
export default function tenantMemberRoutes<T extends AuthedMeRouter>(
  ...[router, tenant]: RouterInitArgs<T>
) {
  const {
    queries: { organizations },
  } = tenant;
  const { assertMember } = createTenantMemberAuthorization(tenant);

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
      await assertMember(ctx.auth.id);

      ctx.body = await listMembers();

      return next();
    }
  );

  /**
   * Remove a member from the tenant, together with their Console access. Admins may remove anyone
   * but the last admin; any member may leave.
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
        if (userId !== ctx.auth.id) {
          await membership.assertAdmin(ctx.auth.id);
        }

        await membership.assertNotLastAdmin(userId, 'remove');
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

  /** Give a member exactly one tenant role. */
  router.put(
    '/tenant/members/:userId/roles',
    koaGuard({
      params: z.object({ userId: z.string().min(1) }),
      body: z.object({ roleName: z.nativeEnum(TenantRole) }),
      status: [204, 403, 404, 422, 501],
    }),
    async (ctx, next) => {
      assertNotCloud();

      const {
        params: { userId },
        body: { roleName },
      } = ctx.guard;

      await withTenantMembership(tenant, async (membership) => {
        await membership.assertAdmin(ctx.auth.id);

        assertThat(
          await membership.organizations.relations.users.exists({
            organizationId: tenantOrganizationId,
            userId,
          }),
          new RequestError({ code: 'entity.not_found', status: 404 })
        );

        if (roleName !== TenantRole.Admin) {
          await membership.assertNotLastAdmin(userId, 'change the role of');
        }

        // Within the membership transaction: `usersRoles.replace()` opens a nested transaction,
        // i.e. a savepoint, on it.
        await membership.organizations.relations.usersRoles.replace(tenantOrganizationId, userId, [
          getTenantRole(roleName).id,
        ]);
      });

      ctx.status = 204;

      return next();
    }
  );
}
