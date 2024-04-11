import assert from 'node:assert';

import { OrganizationInvitationStatus } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { HTTPError } from 'ky';

import { OrganizationApiTest, OrganizationInvitationApiTest } from '#src/helpers/organization.js';
import { UserApiTest } from '#src/helpers/user.js';

const randomId = () => generateStandardId(4);

const expectErrorResponse = async (error: unknown, statusCode: number, code: string) => {
  assert(error instanceof HTTPError);
  expect(error.response.status).toBe(statusCode);
  expect(await error.response.json()).toMatchObject({ code });
};

describe('organization invitation status update', () => {
  const invitationApi = new OrganizationInvitationApiTest();
  const organizationApi = new OrganizationApiTest();
  const userApi = new UserApiTest();

  afterEach(async () => {
    await Promise.all([
      organizationApi.cleanUp(),
      organizationApi.roleApi.cleanUp(),
      invitationApi.cleanUp(),
      userApi.cleanUp(),
    ]);
  });

  it('should expire invitations and disable update after the expiration date', async () => {
    const organization = await organizationApi.create({ name: 'test' });
    const invitation = await invitationApi.create({
      organizationId: organization.id,
      invitee: `${randomId()}@example.com`,
      expiresAt: Date.now() + 100,
    });
    expect(invitation.status).toBe('Pending');

    await new Promise((resolve) => {
      setTimeout(resolve, 200);
    });

    const invitationById = await invitationApi.get(invitation.id);
    expect(invitationById.status).toBe('Expired');

    const error = await invitationApi
      .updateStatus(invitation.id, OrganizationInvitationStatus.Accepted)
      .catch((error: unknown) => error);
    await expectErrorResponse(error, 422, 'request.invalid_input');
  });

  it('should be able to accept an invitation', async () => {
    const organization = await organizationApi.create({ name: 'test' });
    const invitation = await invitationApi.create({
      organizationId: organization.id,
      invitee: `${randomId()}@example.com`,
      expiresAt: Date.now() + 1_000_000,
    });
    expect(invitation.status).toBe('Pending');

    const user = await userApi.create({
      primaryEmail: invitation.invitee,
    });
    const updated = await invitationApi.updateStatus(
      invitation.id,
      OrganizationInvitationStatus.Accepted,
      user.id
    );

    expect(updated.status).toBe('Accepted');

    const userOrganizations = await organizationApi.getUserOrganizations(user.id);
    expect(userOrganizations).toContainEqual(
      expect.objectContaining({
        id: organization.id,
        name: organization.name,
      })
    );
  });

  it('should be able to accept an invitation with roles', async () => {
    const organization = await organizationApi.create({ name: 'test' });
    const role = await organizationApi.roleApi.create({ name: 'test' });
    const invitation = await invitationApi.create({
      organizationId: organization.id,
      invitee: `${randomId()}@example.com`,
      expiresAt: Date.now() + 1_000_000,
      organizationRoleIds: [role.id],
    });
    expect(invitation.status).toBe('Pending');

    const user = await userApi.create({
      primaryEmail: invitation.invitee,
    });
    const updated = await invitationApi.updateStatus(
      invitation.id,
      OrganizationInvitationStatus.Accepted,
      user.id
    );

    expect(updated.status).toBe('Accepted');

    const userOrganizations = await organizationApi.getUserOrganizations(user.id);
    expect(userOrganizations).toContainEqual(
      expect.objectContaining({
        id: organization.id,
        name: organization.name,
        organizationRoles: [expect.objectContaining({ id: role.id, name: role.name })],
      })
    );
  });

  it('should not be able to accept an invitation with a different email', async () => {
    const organization = await organizationApi.create({ name: 'test' });
    const invitation = await invitationApi.create({
      organizationId: organization.id,
      invitee: `${randomId()}@example.com`,
      expiresAt: Date.now() + 1_000_000,
    });
    expect(invitation.status).toBe('Pending');

    const user = await userApi.create({
      primaryEmail: `${randomId()}@example.com`,
    });
    const error = await invitationApi
      .updateStatus(invitation.id, OrganizationInvitationStatus.Accepted, user.id)
      .catch((error: unknown) => error);

    await expectErrorResponse(error, 422, 'request.invalid_input');
  });

  it('should not be able to accept an invitation with an invalid user id', async () => {
    const organization = await organizationApi.create({ name: 'test' });
    const invitation = await invitationApi.create({
      organizationId: organization.id,
      invitee: `${randomId()}@example.com`,
      expiresAt: Date.now() + 1_000_000,
    });
    expect(invitation.status).toBe('Pending');

    const error = await invitationApi
      .updateStatus(invitation.id, OrganizationInvitationStatus.Accepted, 'invalid')
      .catch((error: unknown) => error);

    await expectErrorResponse(error, 404, 'entity.not_found');
  });

  it('should not be able to update the status of an ended invitation', async () => {
    const organization = await organizationApi.create({ name: 'test' });
    const invitation = await invitationApi.create({
      organizationId: organization.id,
      invitee: `${randomId()}@example.com`,
      expiresAt: Date.now() + 1_000_000,
    });
    expect(invitation.status).toBe('Pending');

    await invitationApi.updateStatus(invitation.id, OrganizationInvitationStatus.Revoked);

    const error = await invitationApi
      .updateStatus(invitation.id, OrganizationInvitationStatus.Accepted)
      .catch((error: unknown) => error);

    await expectErrorResponse(error, 422, 'request.invalid_input');
  });
});
