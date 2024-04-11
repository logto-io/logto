import { generateStandardId } from '@logto/shared';

import { createUser, deleteUser } from '#src/api/admin-user.js';
import { OrganizationApiTest, OrganizationInvitationApiTest } from '#src/helpers/organization.js';

const randomId = () => generateStandardId(4);

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

  it('should be able to get invitations by organization id and inviter id', async () => {
    const organization1 = await organizationApi.create({ name: 'test' });
    const organization2 = await organizationApi.create({ name: 'test' });
    const inviter = await createUser({ primaryEmail: 'foo@bar.io' });
    const inviter2 = await createUser({ primaryEmail: 'bar@baz.io' });

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const buildPayload = (inviterId: string, organizationId: string) => ({
      organizationId,
      inviterId,
      invitee: `${randomId()}@example.com`,
      expiresAt: Date.now() + 1_000_000,
    });

    await Promise.all([
      invitationApi.create(buildPayload(inviter.id, organization1.id)),
      invitationApi.create(buildPayload(inviter.id, organization2.id)),
      invitationApi.create(buildPayload(inviter2.id, organization1.id)),
    ]);

    const invitationsByOrganization1 = await invitationApi.getList(
      new URLSearchParams({ organizationId: organization1.id })
    );
    expect(invitationsByOrganization1.length).toBe(2);
    expect(
      invitationsByOrganization1.every(
        (invitation) => invitation.organizationId === organization1.id
      )
    ).toBe(true);

    const invitationsByInviter = await invitationApi.getList(
      new URLSearchParams({ inviterId: inviter.id })
    );
    expect(invitationsByInviter.length).toBe(2);
    expect(invitationsByInviter.every((invitation) => invitation.inviterId === inviter.id)).toBe(
      true
    );

    const allInvitations = await invitationApi.getList();
    expect(allInvitations.length).toBe(3);

    await Promise.all([deleteUser(inviter.id), deleteUser(inviter2.id)]);
  });

  it('should be able to get invitations by invitee', async () => {
    const organization = await organizationApi.create({ name: 'test' });
    const invitee = `${randomId()}@example.com`;
    await invitationApi.create({
      organizationId: organization.id,
      invitee,
      expiresAt: Date.now() + 1_000_000,
    });

    const invitations = await invitationApi.getList(new URLSearchParams({ invitee }));
    expect(invitations.length).toBe(1);
    expect(invitations[0]?.invitee).toBe(invitee);
  });

  it('should have no pagination', async () => {
    const organization = await organizationApi.create({ name: 'test' });
    await Promise.all(
      Array.from({ length: 30 }, async () =>
        invitationApi.create({
          organizationId: organization.id,
          invitee: `${randomId()}@example.com`,
          expiresAt: Date.now() + 1_000_000,
        })
      )
    );

    const invitations = await invitationApi.getList(
      new URLSearchParams({ organizationId: organization.id })
    );
    expect(invitations.length).toBe(30);
  });
});
