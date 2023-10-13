import { HTTPError } from 'got';

import { organizationApi } from '#src/api/organization.js';

describe('organizations', () => {
  it('should get organizations successfully', async () => {
    await organizationApi.create({ name: 'test', description: 'A test organization.' });
    await organizationApi.create({ name: 'test2' });
    const organizations = await organizationApi.getList();

    expect(organizations).toContainEqual(
      expect.objectContaining({ name: 'test', description: 'A test organization.' })
    );
    expect(organizations).toContainEqual(
      expect.objectContaining({ name: 'test2', description: null })
    );
  });

  it('should get organizations with pagination', async () => {
    // Add 20 organizations to exceed the default page size
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

    expect(response instanceof HTTPError && response.response.statusCode).toBe(404);
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
    expect(response instanceof HTTPError && response.response.statusCode).toBe(404);
  });

  it('should fail when try to delete an organization that does not exist', async () => {
    const response = await organizationApi.delete('0').catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.statusCode).toBe(404);
  });
});
