import type { Resource } from '@logto/schemas';
import { managementResource } from '@logto/schemas/lib/seeds';

import { authedAdminApi } from '@/api';
import { generateResourceIndicator, generateResourceName } from '@/utils';

const createResource = (name?: string, indicator?: string) =>
  authedAdminApi
    .post('resources', {
      json: {
        name: name ?? generateResourceName(),
        indicator: indicator ?? generateResourceIndicator(),
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
    const resourceName = generateResourceName();
    const resourceIndicator = generateResourceIndicator();

    const createdResource = await createResource(resourceName, resourceIndicator);

    expect(createdResource.name).toBe(resourceName);
    expect(createdResource.indicator).toBe(resourceIndicator);

    const fetchedCreatedResource = await authedAdminApi
      .get(`resources/${createdResource.id}`)
      .json<Resource>();

    expect(fetchedCreatedResource).toBeTruthy();
  });

  it('should update api resource details successfully', async () => {
    const resource = await createResource();

    expect(resource).toBeTruthy();

    const newResourceName = `new_${resource.name}`;
    const newAccessTokenTtl = resource.accessTokenTtl + 100;

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
    const createdResource = await createResource();

    expect(createdResource).toBeTruthy();

    await authedAdminApi.delete(`resources/${createdResource.id}`);

    const fetchResponseAfterDeletion = await authedAdminApi.get(`resources/${createdResource.id}`, {
      throwHttpErrors: false,
    });

    expect(fetchResponseAfterDeletion.statusCode).toBe(404);
  });
});
