import { TenantRole, defaultTenantId, getTenantOrganizationId } from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';

import { EnvSet } from '#src/env-set/index.js';
import koaErrorHandler from '#src/middleware/koa-error-handler.js';
import koaI18next from '#src/middleware/koa-i18next.js';
import type Queries from '#src/tenants/Queries.js';
import type { Partial2 } from '#src/test-utils/tenant.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

const read = jest.fn(async (): Promise<unknown> => undefined);
mockEsm('#src/license/LicenseReader.js', () => ({
  default: { shared: { read } },
}));

const { MockTenant } = await import('#src/test-utils/tenant.js');
const { createRequester } = await import('#src/utils/test-utils.js');
const tenantRoutes = await pickDefault(import('./tenant.js'));

const tenantOrganizationId = getTenantOrganizationId(defaultTenantId);
const callerId = 'caller';

/** Whether the caller is a member of the tenant organization. */
const isMember = jest.fn(async () => true);
/** The caller's role in the tenant organization. */
const hasRole = jest.fn(
  async ({ organizationRoleId }: { organizationRoleId: string }) =>
    organizationRoleId === TenantRole.Admin
);

/** Make the caller a member with the given role, or no member at all. */
const setCaller = (role?: TenantRole) => {
  isMember.mockResolvedValue(role !== undefined);
  hasRole.mockImplementation(async ({ organizationRoleId }) => organizationRoleId === role);
};

const updateById = jest.fn(async (_id: string, data: { isMfaRequired: boolean }) => ({
  id: tenantOrganizationId,
  ...data,
}));
const getMfaStatus = jest.fn(async () => ({ isMfaRequired: true, hasMfaConfigured: false }));
const getUsersWithoutMfa = jest.fn(async () => [
  { id: 'foo', username: 'foo', primaryEmail: null, name: null, avatar: null },
]);

const mockedQueries = {
  organizations: {
    updateById,
    getMfaStatus,
    relations: {
      users: {
        exists: isMember,
        getUsersWithoutMfa,
      },
      usersRoles: {
        exists: hasRole,
      },
    },
  },
} as unknown as Partial2<Queries>;

const tenantContext = new MockTenant(undefined, mockedQueries);

const request = createRequester({
  middlewares: [koaI18next(), koaErrorHandler()],
  authedRoutes: [
    (router) => {
      router.use(async (ctx, next) => {
        ctx.auth = { ...ctx.auth, id: callerId };
        return next();
      });
    },
    tenantRoutes as never,
  ],
  tenantContext,
});

const installLicense = (mandatoryMfa: boolean) => {
  read.mockResolvedValue({ quota: { mandatoryMfa } });
};

describe('me tenant routes', () => {
  const { isCloud } = EnvSet.values;

  beforeEach(() => {
    setCaller(TenantRole.Admin);
    read.mockResolvedValue(null);
  });

  afterEach(() => {
    jest.clearAllMocks();
    Reflect.set(EnvSet.values, 'isCloud', isCloud);
  });

  describe('GET /tenant/mfa', () => {
    it('should return the requirement and where the caller stands with it', async () => {
      setCaller(TenantRole.Collaborator);

      const response = await request.get('/tenant/mfa');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        isMfaRequired: true,
        hasMfaConfigured: false,
        isMember: true,
        isAdmin: false,
      });
      expect(getMfaStatus).toHaveBeenCalledWith(tenantOrganizationId, callerId);
    });

    it('should tell an admin they can change the requirement', async () => {
      const response = await request.get('/tenant/mfa');

      expect(response.body).toMatchObject({ isMember: true, isAdmin: true });
    });

    it('should answer a Console user outside the tenant without rejecting them', async () => {
      setCaller();

      const response = await request.get('/tenant/mfa');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ isMember: false, isAdmin: false });
    });
  });

  describe('GET /tenant/members-without-mfa', () => {
    it('should list the members without MFA to an admin', async () => {
      const response = await request.get('/tenant/members-without-mfa');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([expect.objectContaining({ id: 'foo' })]);
      expect(getUsersWithoutMfa).toHaveBeenCalledWith(tenantOrganizationId);
    });

    it('should reject a collaborator', async () => {
      setCaller(TenantRole.Collaborator);

      const response = await request.get('/tenant/members-without-mfa');

      expect(response.status).toBe(403);
      expect(getUsersWithoutMfa).not.toHaveBeenCalled();
    });
  });

  describe('PATCH /tenant/mfa', () => {
    it('should require MFA when the license grants it', async () => {
      installLicense(true);

      const response = await request.patch('/tenant/mfa').send({ isMfaRequired: true });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ isMfaRequired: true });
      expect(updateById).toHaveBeenCalledWith(tenantOrganizationId, { isMfaRequired: true });
    });

    it('should refuse to require MFA without the entitlement', async () => {
      installLicense(false);

      const response = await request.patch('/tenant/mfa').send({ isMfaRequired: true });

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({ code: 'subscription.limit_exceeded' });
      expect(updateById).not.toHaveBeenCalled();
    });

    it('should refuse to require MFA without a license', async () => {
      const response = await request.patch('/tenant/mfa').send({ isMfaRequired: true });

      expect(response.status).toBe(403);
      expect(updateById).not.toHaveBeenCalled();
    });

    it('should always allow turning the requirement off', async () => {
      const response = await request.patch('/tenant/mfa').send({ isMfaRequired: false });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ isMfaRequired: false });
      expect(read).not.toHaveBeenCalled();
    });

    it('should reject a collaborator', async () => {
      installLicense(true);
      setCaller(TenantRole.Collaborator);

      const response = await request.patch('/tenant/mfa').send({ isMfaRequired: true });

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({ code: 'auth.forbidden' });
      expect(updateById).not.toHaveBeenCalled();
    });

    it('should reject a caller who is not a member of the tenant', async () => {
      installLicense(true);
      setCaller();

      const response = await request.patch('/tenant/mfa').send({ isMfaRequired: true });

      expect(response.status).toBe(403);
      expect(updateById).not.toHaveBeenCalled();
    });
  });

  it('should return 501 on Cloud', async () => {
    Reflect.set(EnvSet.values, 'isCloud', true);

    const getResponse = await request.get('/tenant/mfa');
    const patchResponse = await request.patch('/tenant/mfa').send({ isMfaRequired: false });

    expect(getResponse.status).toBe(501);
    expect(patchResponse.status).toBe(501);
    expect(updateById).not.toHaveBeenCalled();
  });
});
