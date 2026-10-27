import { OrganizationInvitationStatus, OrganizationInvitations } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import { type HookContextManager } from '#src/libraries/hook/context-manager.js';
import { koaManagementApiHooks } from '#src/middleware/koa-management-api-hooks.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const triggerDataHooks = jest.fn();
const findInvitationById = jest.fn();
const getExistingUserIds = jest.fn();
const updateStatus = jest.fn();

const tenantContext = new MockTenant(undefined, undefined, undefined, {
  hooks: { triggerDataHooks },
});

// eslint-disable-next-line @silverhand/fp/no-mutation
tenantContext.queries.organizations.invitations.findById = findInvitationById;
// eslint-disable-next-line @silverhand/fp/no-mutation
tenantContext.queries.organizations.relations.users.getExistingUserIds = getExistingUserIds;
// eslint-disable-next-line @silverhand/fp/no-mutation
tenantContext.libraries.organizationInvitations.updateStatus = updateStatus;

const organizationInvitationRoutes = await pickDefault(import('./index.js'));

const request = createRequester({
  middlewares: [koaManagementApiHooks(tenantContext.libraries.hooks)],
  authedRoutes: organizationInvitationRoutes,
  tenantContext,
});

const getDataHookContextArray = () => {
  const contextManager = triggerDataHooks.mock.calls.at(-1)?.[1] as HookContextManager | undefined;

  return contextManager?.dataHookContextArray ?? [];
};

const invitation = OrganizationInvitations.guard.parse({
  tenantId: 'default',
  id: 'invitation-id',
  inviterId: null,
  invitee: 'invitee@example.com',
  acceptedUserId: null,
  organizationId: 'organization-id',
  status: OrganizationInvitationStatus.Pending,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  expiresAt: Date.now() + 1_000_000,
});

describe('organization invitation status route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    findInvitationById.mockResolvedValueOnce(invitation);
    getExistingUserIds.mockResolvedValueOnce([]);
  });

  it('emits Organization.UserRoles.Updated with actually assigned roles', async () => {
    updateStatus.mockResolvedValueOnce({
      ...invitation,
      status: OrganizationInvitationStatus.Accepted,
      acceptedUserId: 'user-id',
      organizationRoles: [],
      addedOrganizationRoleIds: ['role-id'],
    });

    const response = await request.put('/organization-invitations/invitation-id/status').send({
      status: OrganizationInvitationStatus.Accepted,
      acceptedUserId: 'user-id',
    });

    expect(response.status).toEqual(200);
    expect(getDataHookContextArray()).toEqual([
      expect.objectContaining({
        event: 'Organization.Membership.Updated',
        organizationId: 'organization-id',
        addedUserIds: ['user-id'],
        matchedRoute: '/organization-invitations/:id/status',
      }),
      expect.objectContaining({
        event: 'Organization.UserRoles.Updated',
        organizationId: 'organization-id',
        userId: 'user-id',
        addedOrganizationRoleIds: ['role-id'],
        removedOrganizationRoleIds: [],
        matchedRoute: '/organization-invitations/:id/status',
      }),
    ]);
  });

  it('does not emit Organization.UserRoles.Updated when no roles were assigned', async () => {
    updateStatus.mockResolvedValueOnce({
      ...invitation,
      status: OrganizationInvitationStatus.Accepted,
      acceptedUserId: 'user-id',
      organizationRoles: [],
      addedOrganizationRoleIds: [],
    });

    const response = await request.put('/organization-invitations/invitation-id/status').send({
      status: OrganizationInvitationStatus.Accepted,
      acceptedUserId: 'user-id',
    });

    expect(response.status).toEqual(200);
    expect(getDataHookContextArray()).toHaveLength(1);
    expect(getDataHookContextArray()[0]).toMatchObject({
      event: 'Organization.Membership.Updated',
    });
  });
});
