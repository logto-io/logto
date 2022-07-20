import { Resource } from '@logto/schemas';
import { managementResource } from '@logto/schemas/lib/seeds';

import { authedAdminApi } from '@/api';

const testApiResource = {
  id: '',
  name: 'gallery',
  indicator: 'https://gallery.logto.io',
};

describe('admin console api resources', () => {
  it('should get management api resource details successfully', async () => {
    const fetchedManagementApiResource = await authedAdminApi
      .get(`resources/${managementResource.id}`)
      .json<Resource>();

    expect(fetchedManagementApiResource.id).toBe(managementResource.id);
    expect(fetchedManagementApiResource.name).toBe(managementResource.name);
    expect(fetchedManagementApiResource.indicator).toBe(managementResource.indicator);
  });

  it('should create api resource successfully', async () => {
    const createdResource = await authedAdminApi
      .post('resources', {
        json: {
          name: testApiResource.name,
          indicator: testApiResource.indicator,
        },
      })
      .json<Resource>();

    expect(createdResource.name).toBe(testApiResource.name);
    expect(createdResource.indicator).toBe(testApiResource.indicator);

    // eslint-disable-next-line @silverhand/fp/no-mutation
    testApiResource.id = createdResource.id;

    const resources = await authedAdminApi.get('resources').json<Resource[]>();

    expect(resources.some((resource) => resource.id === createdResource.id)).toBeTruthy();
  });

  it('should update api resource details successfully', async () => {
    expect(testApiResource.id).toBeTruthy();

    const resource = await authedAdminApi.get(`resources/${testApiResource.id}`).json<Resource>();

    const newResourceName = 'library';
    expect(resource.name).not.toBe(newResourceName);

    const accessTokenTtl = 100;
    expect(resource.accessTokenTtl).not.toBe(accessTokenTtl);

    const updatedApiResource = await authedAdminApi
      .patch(`resources/${resource.id}`, {
        json: {
          name: newResourceName,
          accessTokenTtl,
        },
      })
      .json<Resource>();

    expect(updatedApiResource.name).toBe(newResourceName);
    expect(updatedApiResource.accessTokenTtl).toBe(accessTokenTtl);
  });

  it('should delete api resource successfully', async () => {
    expect(testApiResource.id).toBeTruthy();

    await authedAdminApi.delete(`resources/${testApiResource.id}`);

    const resources = await authedAdminApi.get('applications').json<Resource[]>();

    const hasTestApplication = resources.some((app) => app.id === testApiResource.id);
    expect(hasTestApplication).toBeFalsy();
  });
});
