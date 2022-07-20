import { Resource } from '@logto/schemas';
import { managementResource } from '@logto/schemas/lib/seeds';

import { authedAdminApi } from '@/api';

const createResource = (name: string, indicator: string) =>
  authedAdminApi
    .post('resources', {
      json: {
        name,
        indicator,
      },
    })
    .json<Resource>();

describe('admin console api resources', () => {
  it('should get management api resource details successfully', async () => {
    const fetchedManagementApiResource = await authedAdminApi
      .get(`resources/${managementResource.id}`)
      .json<Resource>();

    expect(fetchedManagementApiResource).toMatchObject(managementResource);
  });

  it('should create api resource successfully', async () => {
    const resourceName = 'gallery';
    const resourceIndicator = 'https://gallery.logto.io';

    const createdResource = await createResource(resourceName, resourceIndicator);

    expect(createdResource.name).toBe(resourceName);
    expect(createdResource.indicator).toBe(resourceIndicator);

    const resources = await authedAdminApi.get('resources').json<Resource[]>();

    expect(resources.some((resource) => resource.id === createdResource.id)).toBeTruthy();
  });

  it('should update api resource details successfully', async () => {
    const resourceName = 'foo';
    const resourceIndicator = 'https://foo.logto.io';

    const resource = await createResource(resourceName, resourceIndicator);

    expect(resource).toBeTruthy();

    const newResourceName = 'foo1';
    expect(resource.name).not.toBe(newResourceName);

    const newAccessTokenTtl = 100;
    expect(resource.accessTokenTtl).not.toBe(newAccessTokenTtl);

    const updatedResource = await authedAdminApi
      .patch(`resources/${resource.id}`, {
        json: {
          name: newResourceName,
          accessTokenTtl: newAccessTokenTtl,
        },
      })
      .json<Resource>();

    expect(updatedResource.id).toBe(resource.id);
    expect(updatedResource.name).toBe(newResourceName);
    expect(updatedResource.accessTokenTtl).toBe(newAccessTokenTtl);
  });

  it('should delete api resource successfully', async () => {
    const resourceName = 'bar';
    const resourceIndicator = 'https://bar.logto.io';

    const createdResource = await createResource(resourceName, resourceIndicator);

    expect(createdResource).toBeTruthy();

    await authedAdminApi.delete(`resources/${createdResource.id}`);

    const resources = await authedAdminApi.get('resources').json<Resource[]>();

    const hasCreatedResource = resources.some((resource) => resource.id === createdResource.id);
    expect(hasCreatedResource).toBeFalsy();
  });
});
