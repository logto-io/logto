import { TenantRole, defaultTenantId, getTenantOrganizationId } from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';

import { EnvSet } from '#src/env-set/index.js';
import koaErrorHandler from '#src/middleware/koa-error-handler.js';
import koaI18next from '#src/middleware/koa-i18next.js';
import type Queries from '#src/tenants/Queries.js';
import type { Partial2 } from '#src/test-utils/tenant.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

const tenantOrganizationId = getTenantOrganizationId(defaultTenantId);
const callerId = 'caller';

/** The tenant roles of each member, keyed by user ID. The caller is an admin by default. */
const memberRoles = new Map<string, TenantRole>();

const hasRole = jest.fn(
  async ({ userId, organizationRoleId }: { userId: string; organizationRoleId: string }) =>
    memberRoles.get(userId) === organizationRoleId
);
const getAdmins = jest.fn(async () => {
  const admins = [...memberRoles].filter(([, role]) => role === TenantRole.Admin);
  return [admins.length, admins.slice(0, 2).map(([id]) => ({ id }))];
});
const deleteMember = jest.fn();
const buildMember = (id: string) => ({
  id,
  avatar: null,
  username: id,
  primaryEmail: null,
  primaryPhone: null,
  name: null,
  organizationRoles: [],
});
const buildMemberPage = (size: number, from: number) =>
  Array.from({ length: size }, (_, index) => buildMember(`user-${from + index}`));
const getUsersByOrganizationId = jest.fn(async () => [
  memberRoles.size,
  [...memberRoles.keys()].map((id) => buildMember(id)),
]);
const getUserScopes = jest.fn(async () => []);

const revokeConsoleAccess = jest.fn();

const organizations = {
  relations: {
    users: { delete: deleteMember, getUsersByOrganizationId },
    usersRoles: { exists: hasRole, getEntities: getAdmins, getUserScopes },
  },
};

const mockedQueries = { organizations } as unknown as Partial2<Queries>;

/** Membership changes run in a transaction; here they run against the same mocked queries. */
const withTenantMembership = jest.fn(
  async (_tenant: unknown, run: (membership: unknown) => unknown) => {
    const { createTenantMemberAuthorization } = await import('./tenant-organization.js');

    return run({
      organizations,
      consoleAccess: { grant: jest.fn(), revoke: revokeConsoleAccess },

      ...createTenantMemberAuthorization({ queries: { organizations } } as never),
    });
  }
);
mockEsm('./tenant-membership.js', () => ({ withTenantMembership }));

const { MockTenant } = await import('#src/test-utils/tenant.js');
const { createRequester } = await import('#src/utils/test-utils.js');
const tenantMemberRoutes = await pickDefault(import('./tenant-members.js'));

const request = createRequester({
  middlewares: [koaI18next(), koaErrorHandler()],
  authedRoutes: [
    (router) => {
      router.use(async (ctx, next) => {
        ctx.auth = { ...ctx.auth, id: callerId };
        return next();
      });
    },
    tenantMemberRoutes as never,
  ],
  tenantContext: new MockTenant(undefined, mockedQueries),
});

describe('me tenant member routes', () => {
  const { isCloud } = EnvSet.values;

  beforeEach(() => {
    memberRoles.clear();
    memberRoles.set(callerId, TenantRole.Admin);
    memberRoles.set('other-admin', TenantRole.Admin);
  });

  afterEach(() => {
    jest.clearAllMocks();
    Reflect.set(EnvSet.values, 'isCloud', isCloud);
  });

  describe('GET /tenant/members', () => {
    it('should list the members to an admin', async () => {
      const response = await request.get('/tenant/members');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    it('should reject a Console user outside the tenant', async () => {
      memberRoles.delete(callerId);

      const response = await request.get('/tenant/members');

      expect(response.status).toBe(403);
      expect(getUsersByOrganizationId).not.toHaveBeenCalled();
    });

    it('should page through every member', async () => {
      getUsersByOrganizationId
        .mockResolvedValueOnce([150, buildMemberPage(100, 0)])
        .mockResolvedValueOnce([150, buildMemberPage(50, 100)]);

      const response = await request.get('/tenant/members');

      expect(response.body).toHaveLength(150);
      expect(getUsersByOrganizationId).toHaveBeenLastCalledWith(tenantOrganizationId, {
        limit: 100,
        offset: 100,
      });
    });
  });

  describe('DELETE /tenant/members/:userId', () => {
    it('should remove a member and their Console access', async () => {
      const response = await request.delete('/tenant/members/other-admin');

      expect(response.status).toBe(204);
      expect(deleteMember).toHaveBeenCalledWith({
        organizationId: tenantOrganizationId,
        userId: 'other-admin',
      });
      expect(revokeConsoleAccess).toHaveBeenCalledWith('other-admin');
    });

    it('should reject a non-member removing someone else', async () => {
      memberRoles.delete(callerId);

      const response = await request.delete('/tenant/members/other-admin');

      expect(response.status).toBe(403);
      expect(deleteMember).not.toHaveBeenCalled();
    });

    it('should let an admin leave while another admin remains', async () => {
      const response = await request.delete(`/tenant/members/${callerId}`);

      expect(response.status).toBe(204);
      expect(deleteMember).toHaveBeenCalled();
    });

    it('should refuse to remove the last admin, even by themselves', async () => {
      memberRoles.delete('other-admin');

      const response = await request.delete(`/tenant/members/${callerId}`);

      expect(response.status).toBe(422);
      expect(deleteMember).not.toHaveBeenCalled();
      expect(revokeConsoleAccess).not.toHaveBeenCalled();
    });
  });

  it('should check the caller and the last admin within the membership transaction', async () => {
    withTenantMembership.mockImplementationOnce(async () => {
      throw new Error('The transaction is not reached.');
    });

    const response = await request.delete('/tenant/members/other-admin');

    expect(response.status).toBe(500);
    expect(hasRole).not.toHaveBeenCalled();
    expect(getAdmins).not.toHaveBeenCalled();
    expect(deleteMember).not.toHaveBeenCalled();
  });

  it('should return 501 on Cloud', async () => {
    Reflect.set(EnvSet.values, 'isCloud', true);

    await expect(request.get('/tenant/members')).resolves.toHaveProperty('status', 501);
    await expect(request.get('/tenant/scopes')).resolves.toHaveProperty('status', 501);
    await expect(request.delete('/tenant/members/other-admin')).resolves.toHaveProperty(
      'status',
      501
    );
  });
});
