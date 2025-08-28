import { HTTPError } from 'ky';

import { OrganizationApiTest } from '#src/helpers/organization.js';
import { UserApiTest } from '#src/helpers/user.js';

// Add additional layer of describe to run tests in band
describe('organization APIs', () => {
  const organizationApi = new OrganizationApiTest();
  const userApi = new UserApiTest();

  afterEach(async () => {
    await Promise.all([organizationApi.cleanUp(), userApi.cleanUp()]);
  });

  it('should get organizations successfully', async () => {
    await organizationApi.create({
      name: 'test',
      description: 'A test organization.',
      customData: { foo: 'bar' },
    });
    await organizationApi.create({ name: 'test2' });
    const organizations = await organizationApi.getList();

    expect(organizations).toContainEqual(
      expect.objectContaining({
        name: 'test',
        description: 'A test organization.',
        customData: { foo: 'bar' },
      })
    );
    expect(organizations).toContainEqual(
      expect.objectContaining({ name: 'test2', description: null, customData: {} })
    );
    for (const organization of organizations) {
      expect(organization).not.toHaveProperty('usersCount');
      expect(organization).not.toHaveProperty('featuredUsers');
    }
  });

  it('should fail when input data is malformed', async () => {
    const response = await organizationApi
      // @ts-expect-error intended to test invalid input
      .create({ name: 'a', customData: 'b' })
      .catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.status).toBe(400);
  });

  it('should get organizations with featured users', async () => {
    const [organization1, organization2] = await Promise.all([
      organizationApi.create({ name: 'test' }),
      organizationApi.create({ name: 'test' }),
    ]);
    const createdUsers = await Promise.all(
      Array.from({ length: 5 }).map(async () => userApi.create({ name: 'featured' }))
    );
    await organizationApi.addUsers(
      organization1.id,
      createdUsers.map((user) => user.id)
    );

    const organizations = await organizationApi.getList(
      new URLSearchParams({
        showFeatured: '1',
      })
    );

    expect(organizations).toContainEqual(expect.objectContaining({ id: organization1.id }));
    expect(organizations).toContainEqual(expect.objectContaining({ id: organization2.id }));
    for (const organization of organizations) {
      expect(organization).toHaveProperty('usersCount');
      expect(organization).toHaveProperty('featuredUsers');
      if (organization.id === organization1.id) {
        expect(organization.usersCount).toBe(5);
        expect(organization.featuredUsers).toHaveLength(3);
      }

      if (organization.id === organization2.id) {
        expect(organization.usersCount).toBe(0);
        expect(organization.featuredUsers).toHaveLength(0);
      }
    }
  });

  it('should get organizations with pagination', async () => {
    // Add organizations to exceed the default page size
    await Promise.all(
      Array.from({ length: 30 }).map(async () => organizationApi.create({ name: 'test' }))
    );

    const organizations = await organizationApi.getList();
    expect(organizations).toHaveLength(20);

    const organizations2 = await organizationApi.getList(
      new URLSearchParams({
        page: '2',
        page_size: '10',
      })
    );
    expect(organizations2.length).toBeGreaterThanOrEqual(10);
    expect(organizations2[0]?.id).not.toBeFalsy();
    expect(organizations2[0]?.id).toBe(organizations[10]?.id);
  });

  it('should be able to create and get organizations by id', async () => {
    const createdOrganization = await organizationApi.create({ name: 'test' });
    const organization = await organizationApi.get(createdOrganization.id);

    expect(organization).toStrictEqual(createdOrganization);
  });

  it('should fail when try to get an organization that does not exist', async () => {
    const response = await organizationApi.get('0').catch((error: unknown) => error);

    expect(response instanceof HTTPError && response.response.status).toBe(404);
  });

  it('should be able to update organization', async () => {
    const createdOrganization = await organizationApi.create({ name: 'test' });
    const organization = await organizationApi.update(createdOrganization.id, {
      name: 'test2',
      description: 'test description.',
    });
    expect(organization).toStrictEqual({
      ...createdOrganization,
      name: 'test2',
      description: 'test description.',
    });
  });

  it('should be able to delete organization', async () => {
    const createdOrganization = await organizationApi.create({ name: 'test' });
    await organizationApi.delete(createdOrganization.id);
    const response = await organizationApi
      .get(createdOrganization.id)
      .catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.status).toBe(404);
  });

  it('should fail when try to delete an organization that does not exist', async () => {
    const response = await organizationApi.delete('0').catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.status).toBe(404);
  });
});
