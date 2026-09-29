import { ConnectorType, TemplateType } from '@logto/connector-kit';
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
  organizationRoles: [{ id: TenantRole.Collaborator, name: TenantRole.Collaborator }],
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
const grantConsoleAccess = jest.fn();
const updateUserById = jest.fn();
const findUserById = jest.fn(async (id: string) => ({
  id,
  name: 'Caller',
  primaryEmail: callerEmail,
  customData: { keep: true, ossOnboarding: { questionnaire: { project: 'personal' } } },
}));

const sendMessage = jest.fn();
const getMessageConnector = jest.fn(async () => ({ sendMessage }));
const withTenant = jest.fn(
  async (_tenantId: string, run: (tenant: TenantContext) => Promise<unknown>) =>
    run({ connectors: { getMessageConnector } } as unknown as TenantContext)
);

const organizations = {
  findById: jest.fn(async () => ({ id: tenantOrganizationId, name: 'Tenant default' })),
  invitations: {
    findById: findInvitationById,
    findEntities: jest.fn(async () => [...invitationsById.values()]),
    deleteById: deleteInvitationById,
  },
  relations: {
    usersRoles: { exists: hasRole },
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
  oneTimeTokens: { insertOneTimeToken, deleteOneTimeTokenById },
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
tenantContext.withTenant = withTenant as unknown as TenantContext['withTenant'];

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
  read.mockResolvedValue({ quota: { consoleCollaboration } });
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
    it('should invite each email with the role, and email a sign-in link through the default tenant', async () => {
      const response = await request
        .post('/tenant/invitations')
        .send({ invitee: ['Foo@example.com', 'bar@example.com'], roleName: TenantRole.Admin });

      expect(response.status).toBe(201);
      expect(response.body).toHaveLength(2);
      expect(insertInvitation).toHaveBeenCalledWith(
        expect.objectContaining({
          invitee: 'foo@example.com',
          inviterId: callerId,
          organizationId: tenantOrganizationId,
          organizationRoleIds: [TenantRole.Admin],
        }),
        false
      );
      expect(withTenant).toHaveBeenCalledWith(defaultTenantId, expect.any(Function));
      expect(getMessageConnector).toHaveBeenCalledWith(ConnectorType.Email);
      expect(sendMessage).toHaveBeenCalledTimes(2);

      const [firstMessage] = sendMessage.mock.calls[0] as [
        { to: string; type: TemplateType; payload: { link: string } },
      ];
      const [firstToken] = insertOneTimeToken.mock.calls[0] as [{ token: string; email: string }];
      const { to, type, payload } = firstMessage;
      const { token, email } = firstToken;
      const link = new URL(payload.link);

      expect(to).toBe('foo@example.com');
      expect(type).toBe(TemplateType.OrganizationInvitation);
      expect(link.pathname).toBe('/console/accept/new-foo');
      expect(link.searchParams.get('one_time_token')).toBe(token);
      expect(link.searchParams.get('email')).toBe('foo@example.com');
      expect(email).toBe('foo@example.com');
    });

    it('should reject a collaborator', async () => {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      callerRole.current = TenantRole.Collaborator;

      const response = await request
        .post('/tenant/invitations')
        .send({ invitee: 'foo@example.com', roleName: TenantRole.Collaborator });

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({ code: 'auth.expected_role_not_found' });
      expect(insertInvitation).not.toHaveBeenCalled();
    });

    it('should refuse to invite without the license entitlement', async () => {
      installLicense(false);

      const response = await request
        .post('/tenant/invitations')
        .send({ invitee: 'foo@example.com', roleName: TenantRole.Collaborator });

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({ code: 'subscription.limit_exceeded' });
      expect(insertInvitation).not.toHaveBeenCalled();
    });

    it('should drop the invitation when its email cannot be sent', async () => {
      getMessageConnector.mockRejectedValueOnce(
        new RequestError({ code: 'connector.not_found', status: 501 })
      );

      const response = await request
        .post('/tenant/invitations')
        .send({ invitee: 'foo@example.com', roleName: TenantRole.Collaborator });

      expect(response.status).toBe(501);
      expect(deleteInvitationById).toHaveBeenCalledWith('new-foo');
      // The undelivered link must not stay usable.
      const [issuedToken] = insertOneTimeToken.mock.calls[0] ?? [];
      expect(deleteOneTimeTokenById).toHaveBeenCalledWith(issuedToken?.id);
    });
  });

  it('should issue the sign-in link for the spelling of an existing account email', async () => {
    findUserByEmail.mockResolvedValueOnce({ id: 'alice', primaryEmail: 'Alice@Example.com' });

    await request
      .post('/tenant/invitations')
      .send({ invitee: 'alice@example.com', roleName: TenantRole.Collaborator });

    const [issuedToken] = insertOneTimeToken.mock.calls[0] ?? [];
    const [message] = sendMessage.mock.calls[0] as [{ to: string; payload: { link: string } }];

    // The sign-in compares the token email with the account's verbatim.
    expect(issuedToken?.email).toBe('Alice@Example.com');
    expect(new URL(message.payload.link).searchParams.get('email')).toBe('Alice@Example.com');
    expect(message.to).toBe('alice@example.com');
  });

  describe('GET /tenant/invitations', () => {
    it('should list the invitations with the inviter names to an admin', async () => {
      const response = await request.get('/tenant/invitations');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: 'pending', inviterName: 'Caller' })])
      );
    });

    it('should reject a collaborator', async () => {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      callerRole.current = TenantRole.Collaborator;

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
    });

    it('should resend a pending invitation with a new link', async () => {
      const response = await request.post('/tenant/invitations/pending/message');

      expect(response.status).toBe(204);
      expect(insertOneTimeToken).toHaveBeenCalledTimes(1);
      expect(sendMessage).toHaveBeenCalledWith(expect.objectContaining({ to: 'foo@example.com' }));
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

    it('should reject a collaborator', async () => {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      callerRole.current = TenantRole.Collaborator;

      await expect(request.delete('/tenant/invitations/pending')).resolves.toHaveProperty(
        'status',
        403
      );
      await expect(request.post('/tenant/invitations/pending/message')).resolves.toHaveProperty(
        'status',
        403
      );
      expect(deleteInvitationById).not.toHaveBeenCalled();
      expect(sendMessage).not.toHaveBeenCalled();
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
