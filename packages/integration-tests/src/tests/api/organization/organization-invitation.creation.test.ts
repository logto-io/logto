import assert from 'node:assert';

import { generateStandardId } from '@logto/shared';
import { HTTPError } from 'got';

import { OrganizationApiTest, OrganizationInvitationApiTest } from '#src/helpers/organization.js';

const randomId = () => generateStandardId(4);

const expectErrorResponse = (error: unknown, status: number, code: string) => {
  assert(error instanceof HTTPError);
  const { statusCode, body: raw } = error.response;
  const body: unknown = JSON.parse(String(raw));
  expect(statusCode).toBe(status);
  expect(body).toMatchObject({ code });
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
    await invitationApi.create(
      {
        organizationId: organization.id,
        invitee: `${randomId()}@example.com`,
        expiresAt: Date.now() + 1_000_000,
      },
      true
    );
  });

  it('should not be able to create invitations with the same email', async () => {
    const organization = await organizationApi.create({ name: 'test' });
    const email = `${randomId()}@example.com`;
    await invitationApi.create(
      {
        organizationId: organization.id,
        invitee: email,
        expiresAt: Date.now() + 1_000_000,
      },
      true
    );
    const error = await invitationApi
      .create({
        organizationId: organization.id,
        invitee: email,
        expiresAt: Date.now() + 1_000_000,
      })
      .catch((error: unknown) => error);

    expectErrorResponse(error, 422, 'entity.unique_integrity_violation');
  });

  it('should be able to create invitations with the same email for different organizations', async () => {
    const [organization1, organization2] = await Promise.all([
      organizationApi.create({ name: 'test1' }),
      organizationApi.create({ name: 'test2' }),
    ]);
    const email = `${randomId()}@example.com`;
    await Promise.all([
      invitationApi.create(
        {
          organizationId: organization1.id,
          invitee: email,
          expiresAt: Date.now() + 1_000_000,
        },
        true
      ),
      invitationApi.create(
        {
          organizationId: organization2.id,
          invitee: email,
          expiresAt: Date.now() + 1_000_000,
        },
        true
      ),
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

    expectErrorResponse(error, 400, 'request.invalid_input');
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

    expectErrorResponse(error, 400, 'guard.invalid_input');
  });

  it('should not be able to create invitations with an invalid organization id', async () => {
    const error = await invitationApi
      .create({
        organizationId: 'invalid',
        invitee: `${randomId()}@example.com`,
        expiresAt: Date.now() + 1_000_000,
      })
      .catch((error: unknown) => error);

    expectErrorResponse(error, 422, 'entity.relation_foreign_key_not_found');
  });

  it('should be able to create invitations with organization role ids', async () => {
    const organization = await organizationApi.create({ name: 'test' });
    const role = await organizationApi.roleApi.create({ name: 'test' });
    const invitation = await invitationApi.create(
      {
        organizationId: organization.id,
        invitee: `${randomId()}@example.com`,
        expiresAt: Date.now() + 1_000_000,
        organizationRoleIds: [role.id],
      },
      true
    );
    expect(invitation.organizationRoles.map((role) => role.id)).toEqual([role.id]);
    expect(invitation.magicLink).toBeDefined();

    // Test if get invitation by id works
    const invitationById = await invitationApi.get(invitation.id);
    expect(invitationById).toEqual(invitation);

    // Test if get invitations works
    const invitations = await invitationApi.getList();
    expect(invitations).toEqual([invitation]);
  });
});
