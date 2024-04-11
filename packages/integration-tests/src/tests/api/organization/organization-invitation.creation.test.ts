import assert from 'node:assert';

import { ConnectorType } from '@logto/connector-kit';
import { generateStandardId } from '@logto/shared';
import { HTTPError } from 'ky';

import { createUser } from '#src/api/admin-user.js';
import { clearConnectorsByTypes, setEmailConnector } from '#src/helpers/connector.js';
import { readConnectorMessage } from '#src/helpers/index.js';
import { OrganizationApiTest, OrganizationInvitationApiTest } from '#src/helpers/organization.js';

const randomId = () => generateStandardId(4);

const expectErrorResponse = async (error: unknown, statusCode: number, code: string) => {
  assert(error instanceof HTTPError);
  expect(error.response.status).toBe(statusCode);
  expect(await error.response.json()).toMatchObject({ code });
};

describe('organization invitation creation', () => {
  const invitationApi = new OrganizationInvitationApiTest();
  const organizationApi = new OrganizationApiTest();

  afterEach(async () => {
    await Promise.all([
      organizationApi.cleanUp(),
      organizationApi.roleApi.cleanUp(),
      invitationApi.cleanUp(),
    ]);
  });

  it('should be able to create an invitation without sending email', async () => {
    const organization = await organizationApi.create({ name: 'test' });
    await invitationApi.create({
      organizationId: organization.id,
      invitee: `${randomId()}@example.com`,
      expiresAt: Date.now() + 1_000_000,
    });
  });

  it('should be able to create an invitation with sending email', async () => {
    await setEmailConnector();

    const organization = await organizationApi.create({ name: 'test' });
    await invitationApi.create({
      organizationId: organization.id,
      invitee: `${randomId()}@example.com`,
      expiresAt: Date.now() + 1_000_000,
      messagePayload: {
        link: 'https://example.com',
      },
    });
    expect(await readConnectorMessage('Email')).toMatchObject({
      type: 'OrganizationInvitation',
      payload: {
        link: 'https://example.com',
      },
    });
  });

  it('should be able to resend an email after creating an invitation', async () => {
    await setEmailConnector();

    const organization = await organizationApi.create({ name: 'test' });
    const email = `${randomId()}@example.com`;
    const invitation = await invitationApi.create({
      organizationId: organization.id,
      invitee: email,
      expiresAt: Date.now() + 1_000_000,
      messagePayload: {
        link: 'https://example.com',
      },
    });
    expect(await readConnectorMessage('Email')).toMatchObject({
      type: 'OrganizationInvitation',
      payload: {
        link: 'https://example.com',
      },
    });

    await invitationApi.resendMessage(invitation.id, {
      link: 'https://example1.com',
    });
    expect(await readConnectorMessage('Email')).toMatchObject({
      type: 'OrganizationInvitation',
      payload: {
        link: 'https://example1.com',
      },
    });
  });

  it('should throw error if email connector is not set', async () => {
    await clearConnectorsByTypes([ConnectorType.Email]);
    const organization = await organizationApi.create({ name: 'test' });
    const error = await invitationApi
      .create({
        organizationId: organization.id,
        invitee: `${randomId()}@example.com`,
        expiresAt: Date.now() + 1_000_000,
        messagePayload: {
          link: 'https://example.com',
        },
      })
      .catch((error: unknown) => error);

    await expectErrorResponse(error, 501, 'connector.not_found');
  });

  it('should not be able to create invitations with the same email', async () => {
    const organization = await organizationApi.create({ name: 'test' });
    const email = `${randomId()}@example.com`;
    await invitationApi.create({
      organizationId: organization.id,
      invitee: email,
      expiresAt: Date.now() + 1_000_000,
    });
    const error = await invitationApi
      .create({
        organizationId: organization.id,
        invitee: email,
        expiresAt: Date.now() + 1_000_000,
      })
      .catch((error: unknown) => error);

    await expectErrorResponse(error, 422, 'entity.unique_integrity_violation');
  });

  it('should be able to create invitations with the same email for different organizations', async () => {
    const [organization1, organization2] = await Promise.all([
      organizationApi.create({ name: 'test1' }),
      organizationApi.create({ name: 'test2' }),
    ]);
    const email = `${randomId()}@example.com`;
    await Promise.all([
      invitationApi.create({
        organizationId: organization1.id,
        invitee: email,
        expiresAt: Date.now() + 1_000_000,
      }),
      invitationApi.create({
        organizationId: organization2.id,
        invitee: email,
        expiresAt: Date.now() + 1_000_000,
      }),
    ]);
  });

  it('should not be able to create invitations with a past expiration date', async () => {
    const organization = await organizationApi.create({ name: 'test' });
    const error = await invitationApi
      .create({
        organizationId: organization.id,
        invitee: `${randomId()}@example.com`,
        expiresAt: Date.now() - 1_000_000,
      })
      .catch((error: unknown) => error);

    await expectErrorResponse(error, 400, 'request.invalid_input');
  });

  it('should not be able to create invitations if the invitee is already a member of the organization', async () => {
    const organization = await organizationApi.create({ name: 'test' });
    const email = `${randomId()}@example.com`;
    const user = await createUser({ primaryEmail: email });
    await organizationApi.addUsers(organization.id, [user.id]);

    const error = await invitationApi
      .create({
        organizationId: organization.id,
        invitee: email,
        expiresAt: Date.now() + 1_000_000,
      })
      .catch((error: unknown) => error);

    await expectErrorResponse(error, 422, 'request.invalid_input');
  });

  it('should not be able to create invitations with an invalid email', async () => {
    const organization = await organizationApi.create({ name: 'test' });
    const error = await invitationApi
      .create({
        organizationId: organization.id,
        invitee: 'invalid',
        expiresAt: Date.now() + 1_000_000,
      })
      .catch((error: unknown) => error);

    await expectErrorResponse(error, 400, 'guard.invalid_input');
  });

  it('should not be able to create invitations with an invalid organization id', async () => {
    const error = await invitationApi
      .create({
        organizationId: 'invalid',
        invitee: `${randomId()}@example.com`,
        expiresAt: Date.now() + 1_000_000,
      })
      .catch((error: unknown) => error);

    await expectErrorResponse(error, 422, 'entity.relation_foreign_key_not_found');
  });

  it('should be able to create invitations with organization role ids', async () => {
    const organization = await organizationApi.create({ name: 'test' });
    const role = await organizationApi.roleApi.create({ name: 'test' });
    const invitation = await invitationApi.create({
      organizationId: organization.id,
      invitee: `${randomId()}@example.com`,
      expiresAt: Date.now() + 1_000_000,
      organizationRoleIds: [role.id],
    });
    expect(invitation.organizationRoles.map((role) => role.id)).toEqual([role.id]);

    // Test if get invitation by id works
    const invitationById = await invitationApi.get(invitation.id);
    expect(invitationById).toEqual(invitation);

    // Test if get invitations works
    const invitations = await invitationApi.getList();
    expect(invitations).toEqual([invitation]);
  });
});
