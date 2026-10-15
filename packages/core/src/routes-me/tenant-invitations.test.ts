import {
  OrganizationInvitationStatus,
  TenantRole,
  defaultTenantId,
  getTenantOrganizationId,
} from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import koaErrorHandler from '#src/middleware/koa-error-handler.js';
import koaI18next from '#src/middleware/koa-i18next.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import type { Partial2 } from '#src/test-utils/tenant.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

const read = jest.fn(async (): Promise<unknown> => undefined);
mockEsm('#src/license/LicenseReader.js', () => ({
  default: { shared: { read } },
}));

const tenantOrganizationId = getTenantOrganizationId(defaultTenantId);
const callerId = 'caller';
const callerEmail = 'caller@example.com';

const buildInvitation = (id: string, invitee: string, organizationId = tenantOrganizationId) => ({
  tenantId: 'admin',
  id,
  inviterId: callerId,
  invitee,
  acceptedUserId: null,
  organizationId,
  status: OrganizationInvitationStatus.Pending,
  createdAt: 0,
  updatedAt: 0,
  expiresAt: Date.now() + 1000,
  organizationRoles: [{ id: TenantRole.Admin, name: TenantRole.Admin }],
});

const invitationsById = new Map<string, ReturnType<typeof buildInvitation>>();

/** The caller's tenant role, or `undefined` when they are no member. */
const callerRole: { current?: TenantRole } = {};

const hasRole = jest.fn(
  async ({ userId, organizationRoleId }: { userId: string; organizationRoleId: string }) =>
    userId === callerId && callerRole.current === organizationRoleId
);
const findInvitationById = jest.fn(async (id: string) => {
  const invitation = invitationsById.get(id);

  if (!invitation) {
    throw new RequestError({ code: 'entity.not_found', status: 404 });
  }

  return invitation;
});
const deleteInvitationById = jest.fn();
/** Invitation IDs are short, so name a new invitation after the local part of its invitee. */
const insertInvitation = jest.fn(async ({ invitee }: { invitee: string }) =>
  buildInvitation(`new-${invitee.split('@')[0] ?? ''}`, invitee)
);
const updateStatus = jest.fn(async (id: string, status: OrganizationInvitationStatus) => ({
  ...buildInvitation(id, callerEmail),
  status,
}));
const insertOneTimeToken = jest.fn(
  async ({ id, token }: { id: string; token: string; email: string }) => ({ id, token })
);
const deleteOneTimeTokenById = jest.fn();
const revokeActiveOneTimeTokensByEmail = jest.fn();
const grantConsoleAccess = jest.fn();
const updateUserById = jest.fn();
const findUserById = jest.fn(async (id: string) => ({
  id,
  name: 'Caller',
  primaryEmail: callerEmail,
  customData: { keep: true, ossOnboarding: { questionnaire: { project: 'personal' } } },
}));

const sendEmail = jest.fn();
const withDefaultTenant = jest.fn(async (run: (tenant: TenantContext) => Promise<unknown>) =>
  run({ libraries: { organizationInvitations: { sendEmail } } } as unknown as TenantContext)
);

const organizations = {
  findById: jest.fn(async () => ({ id: tenantOrganizationId, name: 'Tenant default' })),
  invitations: {
    findById: findInvitationById,
    findEntities: jest.fn(async ({ invitee }: { invitee?: string }) =>
      [...invitationsById.values()].filter(
        (invitation) => !invitee || invitation.invitee.toLowerCase() === invitee.toLowerCase()
      )
    ),
    deleteById: deleteInvitationById,
  },
  relations: {
    usersRoles: { exists: hasRole },
    users: { isMember: jest.fn(async (): Promise<boolean> => false) },
  },
};
const findUserByEmail = jest.fn(async (): Promise<unknown> => null);
const users = {
  findUserById,
  findUserByEmail,
  updateUserById,
  findUsersByIds: jest.fn(async () => [{ id: callerId, name: 'Caller' }]),
};

const mockedQueries = {
  organizations,
  users,
  oneTimeTokens: { insertOneTimeToken, deleteOneTimeTokenById, revokeActiveOneTimeTokensByEmail },
} as unknown as Partial2<Queries>;

const membershipConnection = { name: 'membership transaction' };

/** Membership changes run in a transaction; here they run against the same mocked queries. */
const withTenantMembership = jest.fn(
  async (_tenant: unknown, run: (membership: unknown) => unknown) => {
    const { createTenantMemberAuthorization } = await import('./tenant-organization.js');

    return run({
      connection: membershipConnection,
      organizations,
      users,
      oneTimeTokens: { revokeActiveOneTimeTokensByEmail },
      consoleAccess: { grant: grantConsoleAccess, revoke: jest.fn() },

      ...createTenantMemberAuthorization({ queries: { organizations } } as never),
    });
  }
);
mockEsm('./tenant-membership.js', () => ({ withTenantMembership }));

const { MockTenant } = await import('#src/test-utils/tenant.js');
const { createRequester } = await import('#src/utils/test-utils.js');
const tenantInvitationRoutes = await pickDefault(import('./tenant-invitations.js'));

const mockedLibraries = {
  organizationInvitations: {
    insert: insertInvitation,
    updateStatus,
    getOrganizationInvitationTemplateContext: jest.fn(async () => ({
      organization: { id: tenantOrganizationId, name: 'Tenant default' },
    })),
  },
} as unknown as Partial2<Libraries>;

const tenantContext = new MockTenant(undefined, mockedQueries, undefined, mockedLibraries);
// eslint-disable-next-line @silverhand/fp/no-mutation -- Replace the tenant accessor of the mock.
tenantContext.withDefaultTenant =
  withDefaultTenant as unknown as TenantContext['withDefaultTenant'];

const request = createRequester({
  middlewares: [koaI18next(), koaErrorHandler()],
  authedRoutes: [
    (router) => {
      router.use(async (ctx, next) => {
        ctx.auth = { ...ctx.auth, id: callerId };
        return next();
      });
    },
    tenantInvitationRoutes as never,
  ],
  tenantContext,
});

const installLicense = (consoleCollaboration: boolean) => {
  read.mockResolvedValue({
    quota: { consoleCollaboration },
    graceEndsAt: new Date(Date.now() + 60_000).toISOString(),
  });
};

describe('me tenant invitation routes', () => {
  const { isCloud } = EnvSet.values;

  beforeEach(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    callerRole.current = TenantRole.Admin;
    installLicense(true);
    invitationsById.clear();
    invitationsById.set('pending', buildInvitation('pending', 'foo@example.com'));
    invitationsById.set('mine', buildInvitation('mine', 'CALLER@example.com'));
    invitationsById.set('elsewhere', buildInvitation('elsewhere', callerEmail, 't-other'));
  });

  afterEach(() => {
    jest.clearAllMocks();
    Reflect.set(EnvSet.values, 'isCloud', isCloud);
  });

  describe('POST /tenant/invitations', () => {
    it('should invite admins and send sign-in links', async () => {
      const response = await request
        .post('/tenant/invitations')
        .send({ invitee: ['Baz@example.com', 'bar@example.com'] });

      expect(response.status).toBe(201);
      expect(response.body).toHaveLength(2);
      expect(insertInvitation).toHaveBeenCalledWith(
        expect.objectContaining({
          invitee: 'baz@example.com',
          inviterId: callerId,
          organizationId: tenantOrganizationId,
          organizationRoleIds: [TenantRole.Admin],
        }),
        false
      );
      expect(withDefaultTenant).toHaveBeenCalledWith(expect.any(Function));
      // Through the invitation library of the default tenant, which applies the send rate guard.
      expect(sendEmail).toHaveBeenCalledTimes(2);

      const [to, payload] = sendEmail.mock.calls[0] as [string, { link: string }];
      const [firstToken] = insertOneTimeToken.mock.calls[0] as [
        { id: string; token: string; email: string },
      ];
      const { id, token, email } = firstToken;
      const link = new URL(payload.link);

      expect(to).toBe('baz@example.com');
      expect(link.pathname).toBe('/console/accept/new-baz');
      expect(link.searchParams.get('one_time_token')).toBe(token);
      expect(link.searchParams.get('email')).toBe('baz@example.com');
      expect(email).toBe('baz@example.com');
      // Links sent earlier to the invitee stop working once the new one is out.
      expect(revokeActiveOneTimeTokensByEmail).toHaveBeenCalledWith('baz@example.com', id);
    });

    it('should create nothing when any invitee already has a pending invitation', async () => {
      const response = await request
        .post('/tenant/invitations')
        .send({ invitee: ['bar@example.com', 'Foo@example.com'] });

      expect(response.status).toBe(422);
      expect(insertInvitation).not.toHaveBeenCalled();
      expect(sendEmail).not.toHaveBeenCalled();
    });

    it('should create nothing when any invitee is already a member', async () => {
      organizations.relations.users.isMember.mockResolvedValueOnce(true);

      const response = await request
        .post('/tenant/invitations')
        .send({ invitee: ['bar@example.com', 'baz@example.com'] });

      expect(response.status).toBe(422);
      expect(insertInvitation).not.toHaveBeenCalled();
      expect(sendEmail).not.toHaveBeenCalled();
    });

    it('should reject a non-member', async () => {
      // eslint-disable-next-line @silverhand/fp/no-mutation -- Simulate a caller outside the tenant.
      callerRole.current = undefined;

      const response = await request
        .post('/tenant/invitations')
        .send({ invitee: 'foo@example.com' });

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({ code: 'auth.expected_role_not_found' });
      expect(insertInvitation).not.toHaveBeenCalled();
    });

    it('should refuse to invite without the license entitlement', async () => {
      installLicense(false);

      const response = await request
        .post('/tenant/invitations')
        .send({ invitee: 'foo@example.com' });

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({ code: 'subscription.limit_exceeded' });
      expect(insertInvitation).not.toHaveBeenCalled();
    });

    it('should drop the invitation when its email cannot be sent', async () => {
      sendEmail.mockRejectedValueOnce(
        new RequestError({ code: 'request.message_rate_limited', status: 429 })
      );

      const response = await request
        .post('/tenant/invitations')
        .send({ invitee: 'baz@example.com' });

      expect(response.status).toBe(429);
      expect(deleteInvitationById).toHaveBeenCalledWith('new-baz');
      // The undelivered link must not stay usable.
      const [issuedToken] = insertOneTimeToken.mock.calls[0] ?? [];
      expect(deleteOneTimeTokenById).toHaveBeenCalledWith(issuedToken?.id);
    });
  });

  it('should issue the sign-in link for the spelling of an existing account email', async () => {
    findUserByEmail.mockResolvedValueOnce({ id: 'alice', primaryEmail: 'Alice@Example.com' });

    await request.post('/tenant/invitations').send({ invitee: 'alice@example.com' });

    const [issuedToken] = insertOneTimeToken.mock.calls[0] ?? [];
    const [to, payload] = sendEmail.mock.calls[0] as [string, { link: string }];

    // The sign-in compares the token email with the account's verbatim.
    expect(issuedToken?.email).toBe('Alice@Example.com');
    expect(new URL(payload.link).searchParams.get('email')).toBe('Alice@Example.com');
    expect(to).toBe('alice@example.com');
  });

  describe('GET /tenant/invitations', () => {
    it('should list the invitations with the inviter names to an admin', async () => {
      const response = await request.get('/tenant/invitations');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: 'pending', inviterName: 'Caller' })])
      );
    });

    it('should reject a non-member', async () => {
      // eslint-disable-next-line @silverhand/fp/no-mutation -- Simulate a caller outside the tenant.
      callerRole.current = undefined;

      await expect(request.get('/tenant/invitations')).resolves.toHaveProperty('status', 403);
    });
  });

  describe('invitation management', () => {
    it('should revoke an invitation without the license entitlement', async () => {
      installLicense(false);

      const response = await request
        .patch('/tenant/invitations/pending/status')
        .send({ status: OrganizationInvitationStatus.Revoked });

      expect(response.status).toBe(200);
      expect(updateStatus).toHaveBeenCalledWith(
        'pending',
        OrganizationInvitationStatus.Revoked,
        undefined,
        membershipConnection
      );
      expect(revokeActiveOneTimeTokensByEmail).toHaveBeenCalledWith('foo@example.com');
    });

    it('should revoke the sign-in link of a deleted pending invitation', async () => {
      const response = await request.delete('/tenant/invitations/pending');

      expect(response.status).toBe(204);
      expect(deleteInvitationById).toHaveBeenCalledWith('pending');
      expect(revokeActiveOneTimeTokensByEmail).toHaveBeenCalledWith('foo@example.com');
    });

    it('should resend a pending invitation with a new link', async () => {
      const response = await request.post('/tenant/invitations/pending/message');

      expect(response.status).toBe(204);
      expect(insertOneTimeToken).toHaveBeenCalledTimes(1);
      expect(sendEmail).toHaveBeenCalledWith('foo@example.com', expect.anything());

      const [issuedToken] = insertOneTimeToken.mock.calls[0] ?? [];
      expect(revokeActiveOneTimeTokensByEmail).toHaveBeenCalledWith(
        'foo@example.com',
        issuedToken?.id
      );
    });

    it('should not touch an invitation to another organization', async () => {
      const revoke = await request
        .patch('/tenant/invitations/elsewhere/status')
        .send({ status: OrganizationInvitationStatus.Revoked });
      const remove = await request.delete('/tenant/invitations/elsewhere');

      expect(revoke.status).toBe(404);
      expect(remove.status).toBe(404);
      expect(updateStatus).not.toHaveBeenCalled();
      expect(deleteInvitationById).not.toHaveBeenCalled();
    });

    it('should reject a non-member', async () => {
      // eslint-disable-next-line @silverhand/fp/no-mutation -- Simulate a caller outside the tenant.
      callerRole.current = undefined;

      await expect(request.delete('/tenant/invitations/pending')).resolves.toHaveProperty(
        'status',
        403
      );
      await expect(request.post('/tenant/invitations/pending/message')).resolves.toHaveProperty(
        'status',
        403
      );
      expect(deleteInvitationById).not.toHaveBeenCalled();
      expect(sendEmail).not.toHaveBeenCalled();
    });
  });

  describe('invitee routes', () => {
    it('should show and accept an invitation addressed to the caller, and grant Console access', async () => {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      callerRole.current = undefined;

      const shown = await request.get('/invitations/mine');
      const accepted = await request
        .patch('/invitations/mine/status')
        .send({ status: OrganizationInvitationStatus.Accepted });

      expect(shown.status).toBe(200);
      expect(accepted.status).toBe(204);
      // Joining and Console access commit together, in the membership transaction.
      expect(withTenantMembership).toHaveBeenCalledTimes(1);
      expect(updateStatus).toHaveBeenCalledWith(
        'mine',
        OrganizationInvitationStatus.Accepted,
        callerId,
        membershipConnection
      );
      expect(grantConsoleAccess).toHaveBeenCalledWith(callerId);
      expect(revokeActiveOneTimeTokensByEmail).toHaveBeenCalledWith('CALLER@example.com');
      expect(updateUserById).toHaveBeenCalledWith(callerId, {
        customData: {
          keep: true,
          ossOnboarding: { questionnaire: { project: 'personal' }, isOnboardingDone: true },
        },
      });
    });

    it('should refuse to accept without the license entitlement', async () => {
      installLicense(false);

      const accepted = await request
        .patch('/invitations/mine/status')
        .send({ status: OrganizationInvitationStatus.Accepted });

      expect(accepted.status).toBe(403);
      expect(accepted.body).toMatchObject({ code: 'subscription.limit_exceeded' });
      expect(updateStatus).not.toHaveBeenCalled();
    });

    it('should hide an invitation addressed to someone else', async () => {
      const shown = await request.get('/invitations/pending');
      const accepted = await request
        .patch('/invitations/pending/status')
        .send({ status: OrganizationInvitationStatus.Accepted });

      expect(shown.status).toBe(403);
      expect(accepted.status).toBe(403);
      expect(updateStatus).not.toHaveBeenCalled();
      expect(grantConsoleAccess).not.toHaveBeenCalled();
    });

    it('should not accept an invitation to another organization', async () => {
      const accepted = await request
        .patch('/invitations/elsewhere/status')
        .send({ status: OrganizationInvitationStatus.Accepted });

      expect(accepted.status).toBe(404);
      expect(updateStatus).not.toHaveBeenCalled();
    });
  });

  it('should return 501 on Cloud', async () => {
    Reflect.set(EnvSet.values, 'isCloud', true);

    await expect(request.get('/tenant/invitations')).resolves.toHaveProperty('status', 501);
    await expect(request.get('/invitations/mine')).resolves.toHaveProperty('status', 501);
  });
});
