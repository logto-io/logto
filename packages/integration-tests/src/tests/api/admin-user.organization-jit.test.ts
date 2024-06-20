import { getUserOrganizations } from '#src/api/index.js';
import { OrganizationApiTest } from '#src/helpers/organization.js';
import { UserApiTest } from '#src/helpers/user.js';
import { randomString } from '#src/utils.js';

describe('organization just-in-time provisioning', () => {
  const organizationApi = new OrganizationApiTest();
  const userApi = new UserApiTest();

  afterEach(async () => {
    await Promise.all([organizationApi.cleanUp(), userApi.cleanUp()]);
  });

  it('should automatically provision a user to the organizations with roles', async () => {
    const organizations = await Promise.all([
      organizationApi.create({ name: 'foo' }),
      organizationApi.create({ name: 'bar' }),
      organizationApi.create({ name: 'baz' }),
    ]);
    const roles = await Promise.all([
      organizationApi.roleApi.create({ name: randomString() }),
      organizationApi.roleApi.create({ name: randomString() }),
    ]);
    const emailDomain = 'foo.com';
    await Promise.all(
      organizations.map(async (organization) =>
        organizationApi.jit.addEmailDomain(organization.id, emailDomain)
      )
    );
    await Promise.all([
      organizationApi.jit.roles.add(organizations[0].id, [roles[0].id, roles[1].id]),
      organizationApi.jit.roles.add(organizations[1].id, [roles[0].id]),
    ]);

    const email = randomString() + '@' + emailDomain;
    const { id } = await userApi.create({ primaryEmail: email });

    const userOrganizations = await getUserOrganizations(id);
    expect(userOrganizations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: organizations[0].id,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          organizationRoles: expect.arrayContaining([
            expect.objectContaining({ id: roles[0].id }),
            expect.objectContaining({ id: roles[1].id }),
          ]),
        }),
        expect.objectContaining({
          id: organizations[1].id,
          organizationRoles: [expect.objectContaining({ id: roles[0].id })],
        }),
        expect.objectContaining({
          id: organizations[2].id,
          organizationRoles: [],
        }),
      ])
    );
  });

  it('should automatically provision a user to the organizations without roles', async () => {
    const organizations = await Promise.all([
      organizationApi.create({ name: 'foo' }),
      organizationApi.create({ name: 'bar' }),
      organizationApi.create({ name: 'baz' }),
    ]);
    const emailDomain = 'foo.com';
    await Promise.all(
      organizations.map(async (organization) =>
        organizationApi.jit.addEmailDomain(organization.id, emailDomain)
      )
    );

    const email = randomString() + '@' + emailDomain;
    const { id } = await userApi.create({ primaryEmail: email });

    const userOrganizations = await getUserOrganizations(id);
    expect(userOrganizations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: organizations[0].id,
          organizationRoles: [],
        }),
        expect.objectContaining({
          id: organizations[1].id,
          organizationRoles: [],
        }),
        expect.objectContaining({
          id: organizations[2].id,
          organizationRoles: [],
        }),
      ])
    );
  });
});
