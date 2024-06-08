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

  it('should automatically provision a user to the organization with the matched email domain', async () => {
    const organizations = await Promise.all([
      organizationApi.create({ name: 'foo' }),
      organizationApi.create({ name: 'bar' }),
    ]);
    const emailDomain = 'foo.com';
    await Promise.all(
      organizations.map(async (organization) =>
        organizationApi.addEmailDomain(organization.id, emailDomain)
      )
    );

    const email = randomString() + '@' + emailDomain;
    const { id } = await userApi.create({ primaryEmail: email });

    const userOrganizations = await getUserOrganizations(id);
    expect(userOrganizations).toEqual(
      expect.arrayContaining(organizations.map((item) => expect.objectContaining({ id: item.id })))
    );
  });
});
