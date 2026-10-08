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

const isMember = jest.fn(async ({ userId }: { userId: string }) => memberRoles.has(userId));
const hasRole = jest.fn(
  async ({ userId, organizationRoleId }: { userId: string; organizationRoleId: string }) =>
    memberRoles.get(userId) === organizationRoleId
);
const getAdmins = jest.fn(async () => {
  const admins = [...memberRoles].filter(([, role]) => role === TenantRole.Admin);
  return [admins.length, admins.slice(0, 2).map(([id]) => ({ id }))];
});
const deleteMember = jest.fn();
const replaceRoles = jest.fn();
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
    users: { exists: isMember, delete: deleteMember, getUsersByOrganizationId },
    usersRoles: { exists: hasRole, getEntities: getAdmins, replace: replaceRoles, getUserScopes },
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
    memberRoles.set('collaborator', TenantRole.Collaborator);
  });

  afterEach(() => {
    jest.clearAllMocks();
    Reflect.set(EnvSet.values, 'isCloud', isCloud);
  });

  describe('GET /tenant/members', () => {
    it('should list the members to a collaborator', async () => {
      memberRoles.set(callerId, TenantRole.Collaborator);

      const response = await request.get('/tenant/members');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(3);
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
      const response = await request.delete('/tenant/members/collaborator');

      expect(response.status).toBe(204);
      expect(deleteMember).toHaveBeenCalledWith({
        organizationId: tenantOrganizationId,
        userId: 'collaborator',
      });
      expect(revokeConsoleAccess).toHaveBeenCalledWith('collaborator');
    });

    it('should reject a collaborator removing someone else', async () => {
      memberRoles.set(callerId, TenantRole.Collaborator);

      const response = await request.delete('/tenant/members/other-admin');

      expect(response.status).toBe(403);
      expect(deleteMember).not.toHaveBeenCalled();
    });

    it('should let a collaborator leave', async () => {
      memberRoles.set(callerId, TenantRole.Collaborator);

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

    it('should remove an admin while another admin is left', async () => {
      const response = await request.delete('/tenant/members/other-admin');

      expect(response.status).toBe(204);
    });
  });

  describe('PUT /tenant/members/:userId/roles', () => {
    it('should promote an existing collaborator to admin', async () => {
      const response = await request
        .put('/tenant/members/collaborator/roles')
        .send({ roleName: TenantRole.Admin });

      expect(response.status).toBe(204);
      expect(replaceRoles).toHaveBeenCalledWith(tenantOrganizationId, 'collaborator', [
        TenantRole.Admin,
      ]);
    });

    it('should reject a collaborator', async () => {
      memberRoles.set(callerId, TenantRole.Collaborator);

      const response = await request
        .put('/tenant/members/collaborator/roles')
        .send({ roleName: TenantRole.Admin });

      expect(response.status).toBe(403);
      expect(replaceRoles).not.toHaveBeenCalled();
    });

    it('should refuse to demote an admin even when another admin remains', async () => {
      const response = await request
        .put(`/tenant/members/${callerId}/roles`)
        .send({ roleName: TenantRole.Collaborator });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({ code: 'guard.invalid_input' });
      expect(replaceRoles).not.toHaveBeenCalled();
    });

    it('should reject a user outside the tenant', async () => {
      const response = await request
        .put('/tenant/members/stranger/roles')
        .send({ roleName: TenantRole.Admin });

      expect(response.status).toBe(404);
      expect(replaceRoles).not.toHaveBeenCalled();
    });
  });

  it('should check the caller and the last admin within the membership transaction', async () => {
    withTenantMembership.mockImplementationOnce(async () => {
      throw new Error('The transaction is not reached.');
    });

    const response = await request.delete('/tenant/members/collaborator');

    expect(response.status).toBe(500);
    expect(hasRole).not.toHaveBeenCalled();
    expect(getAdmins).not.toHaveBeenCalled();
    expect(deleteMember).not.toHaveBeenCalled();
  });

  it('should return 501 on Cloud', async () => {
    Reflect.set(EnvSet.values, 'isCloud', true);

    await expect(request.get('/tenant/members')).resolves.toHaveProperty('status', 501);
    await expect(request.get('/tenant/scopes')).resolves.toHaveProperty('status', 501);
    await expect(request.delete('/tenant/members/collaborator')).resolves.toHaveProperty(
      'status',
      501
    );
  });
});
